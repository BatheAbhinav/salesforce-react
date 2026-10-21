import { createDataSDK } from '@salesforce/platform-sdk';
import { CryptoService } from './CryptoService';

export type ApexResponse<T = Array<Record<string, unknown>>> = {
  data: T;
  errors?: Array<{ message: string }>;
};

type DataSdk = Awaited<ReturnType<typeof createDataSDK>>;
type HttpMethod = 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE';

/** Thrown only when the encrypted channel cannot be used; never for failed authentication. */
class EncryptionUnavailableError extends Error {}

// Set VITE_ENCRYPTION_FALLBACK=false to forbid plaintext fallback.
const FALLBACK_ENABLED = import.meta.env.VITE_ENCRYPTION_FALLBACK !== 'false';

export class ApexClient {
  private cryptoService = new CryptoService();
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SFDC_BASE_URL;
    this.accessToken = import.meta.env.VITE_SFDC_ACCESS_TOKEN || '';
  }

  async callApexMethod<T>(
    endPoint: string,
    options?: { method?: HttpMethod; body?: unknown }
  ): Promise<ApexResponse<T>> {
    if (!this.baseUrl || !this.accessToken) {
      throw new Error(
        'Base URL or Access Token is not defined in environment variables.'
      );
    }

    if (new URL(this.baseUrl).protocol !== 'https:') {
      throw new Error('Salesforce requires HTTPS.');
    }
    const dataSdk = await createDataSDK();
    if (!dataSdk.fetch) {
      throw new Error('DataSDK fetch method is not available.');
    }

    const method = options?.method ?? 'GET';
    try {
      console.log("Calling via encrypted channel");
      return await this.callEncrypted<T>(
        dataSdk,
        endPoint,
        method,
        options?.body
      );
    } catch (error) {
      console.log("Calling via plaintext channel");
      if (!FALLBACK_ENABLED || !(error instanceof EncryptionUnavailableError)) {
        throw error;
      }
      console.log(
        `Encrypted channel unavailable for ${method} ${endPoint}; falling back to PLAINTEXT.`
      );
      return this.callPlain<T>(dataSdk, endPoint, method, options?.body);
    }
  }

  private async callEncrypted<T>(
    dataSdk: DataSdk,
    endPoint: string,
    method: HttpMethod,
    body: unknown
  ): Promise<ApexResponse<T>> {
    let key: CryptoKey;
    try {
      const keyResponse = await dataSdk.fetch!(
        '/services/apexrest/payload/key',
        {
          method: 'GET',
          cache: 'no-store',
        }
      );
      if (!keyResponse.ok) throw new Error('Encryption key unavailable.');
      key = await this.cryptoService.importKey((await keyResponse.json()).key);
    } catch (error) {
      throw new EncryptionUnavailableError((error as Error).message);
    }

    const payload = await this.cryptoService.encrypt(key, {
      method,
      path: `/services/apexrest/${endPoint}`,
      body: body ?? null,
    });
    const response = await dataSdk.fetch!('/services/apexrest/payload/invoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ payload }),
    });
    if (!response.ok) {
      // Only reads are safe to repeat in plaintext; a rejected write may already have run.
      if (method === 'GET') {
        throw new EncryptionUnavailableError(
          'Encrypted Apex operation rejected.'
        );
      }
      throw new Error('Encrypted Apex operation rejected.');
    }

    return {
      data: await this.cryptoService.decrypt<T>(
        key,
        (await response.json()).payload
      ),
    };
  }

  private async callPlain<T>(
    dataSdk: DataSdk,
    endPoint: string,
    method: HttpMethod,
    body: unknown
  ): Promise<ApexResponse<T>> {
    const response = await dataSdk.fetch!(`/services/apexrest/${endPoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      cache: 'default',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        message = (await response.json())?.message ?? message;
      } catch {
        // Response body wasn't JSON (or was empty) — fall back to statusText.
      }
      throw new Error(`Error calling Apex method ${endPoint}: ${message}`);
    }

    return { data: await response.json() } as ApexResponse<T>;
  }
}
