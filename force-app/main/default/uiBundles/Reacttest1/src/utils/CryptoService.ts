const AAD = new TextEncoder().encode('apex-payload-v1');

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (text: string) =>
  Uint8Array.from(atob(text), char => char.charCodeAt(0));

/** AES-256-GCM. Wire format matches Apex encryptWithManagedIV: base64(0x0C | IV | ciphertext | tag). */
export class CryptoService {
  async importKey(base64Key: string): Promise<CryptoKey> {
    const raw = fromBase64(base64Key);
    if (raw.length !== 32) throw new Error('Invalid encryption key.');
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [
      'encrypt',
      'decrypt',
    ]);
  }

  async encrypt(key: CryptoKey, value: unknown): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const sealed = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: AAD },
        key,
        new TextEncoder().encode(JSON.stringify(value))
      )
    );
    const out = new Uint8Array(1 + iv.length + sealed.length);
    out[0] = iv.length;
    out.set(iv, 1);
    out.set(sealed, 1 + iv.length);
    return toBase64(out);
  }

  async decrypt<T>(key: CryptoKey, base64Payload: string): Promise<T> {
    const data = fromBase64(base64Payload);
    try {
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: data.slice(1, 13), additionalData: AAD },
        key,
        data.slice(13)
      );
      return JSON.parse(new TextDecoder().decode(plain)) as T;
    } catch {
      throw new Error('Encrypted payload authentication failed.');
    }
  }
}
