export class ApexClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async callApexMethod<T>(
    methodName: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    // const url = `${this.baseUrl}/apex/${methodName}`;
    const url = `https://wise-koala-nk22d0-dev-ed--c.trailblaze.my.salesforce.app/services/apexrest/accounts`;
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.error('Error calling Apex method:', error);
      throw error;
    }

    if (!response.ok) {
      throw new Error(
        `Error calling Apex method ${methodName}: ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }
}
