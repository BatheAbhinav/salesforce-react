import { createDataSDK } from '@salesforce/platform-sdk';

export type ApexResponse = {
  data: Array<Record<string, unknown>>;
  errors?: Array<{ message: string }>;
};

export class ApexClient {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SFDC_BASE_URL;
    this.accessToken = import.meta.env.VITE_SFDC_ACCESS_TOKEN || '';
  }

  async callApexMethod<ApexResponse>(endPoint: string): Promise<ApexResponse> {
    console.log('4th October Log');
    if (!this.baseUrl || !this.accessToken) {
      throw new Error(
        'Base URL or Access Token is not defined in environment variables.'
      );
    }

    let url: string;
    url = `${this.baseUrl}/${endPoint}`;
    console.log('Calling Apex method at URL:', url);

    let response;
    try {
      // response = await fetch(url, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${this.accessToken}`,
      //     credentials: 'include',
      //   },
      //   body: JSON.stringify(params),
      // });

      const dataSdk = await createDataSDK();
      if (!dataSdk.fetch) {
        throw new Error('DataSDK fetch method is not available.');
      }

      response = await dataSdk.fetch(`/services/apexrest/${endPoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${this.accessToken}`,
        },
        cache: 'default',
      });
    } catch (error) {
      console.error('Error calling Apex method:', error);
      throw error;
    }

    if (!response.ok) {
      throw new Error(
        `Error calling Apex method ${endPoint}: ${response.statusText}`
      );
    }

    return {
      data: await response.json(),
      errors: response.ok ? undefined : [{ message: response.statusText }],
    } as ApexResponse;
  }
}
