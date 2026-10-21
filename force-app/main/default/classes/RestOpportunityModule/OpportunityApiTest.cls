@isTest
private class OpportunityApiTest {
  @isTest
  static void testUpdateOpportunity() {
    Opportunity opp = new Opportunity(
      Name = 'Original Deal',
      StageName = 'Prospecting',
      CloseDate = Date.today().addDays(30)
    );
    insert opp;

    RestRequest request = new RestRequest();
    request.requestUri =
      'https://yourInstance.my.salesforce.com/services/apexrest/opportunities/' + opp.Id;
    request.httpMethod = 'PATCH';
    request.requestBody = Blob.valueOf(
      '{"Name":"Updated Deal","Amount":50000,"StageName":"Closed Won","CloseDate":"2026-12-31"}'
    );
    RestContext.request = request;
    RestContext.response = new RestResponse();

    Test.startTest();
    Opportunity result = OpportunityApi.updateOpportunity();
    Test.stopTest();

    System.assertEquals('Updated Deal', result.Name);
    System.assertEquals(50000, result.Amount);
    System.assertEquals('Closed Won', result.StageName);
    System.assertEquals(Date.newInstance(2026, 12, 31), result.CloseDate);
  }
}
