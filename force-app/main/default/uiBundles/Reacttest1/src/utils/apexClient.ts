export class ApexClient {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SFDC_BASE_URL;
    this.accessToken = import.meta.env.VITE_SFDC_ACCESS_TOKEN || '';
  }

  async callApexMethod<T>(
    endPoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    if (!this.baseUrl || !this.accessToken) {
      throw new Error(
        'Base URL or Access Token is not defined in environment variables.'
      );
    }

    const url = `${this.baseUrl}/apex/${endPoint}`;
    console.log(`DEBUG: ${url}`);
    console.log(`DEBUG token: ${this.accessToken}`);
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(params),
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

    return await response.json();
  }
}
