@isTest
private class AccountApiTest {
  @isTest
  static void testUpdateAccount() {
    Account acc = new Account(Name = 'Original Name', Industry = 'Technology');
    insert acc;

    RestRequest request = new RestRequest();
    request.requestUri =
      'https://yourInstance.my.salesforce.com/services/apexrest/accounts/' + acc.Id;
    request.httpMethod = 'PATCH';
    request.requestBody = Blob.valueOf(
      '{"Name":"Updated Name","Phone":"555-1234","AnnualRevenue":1000000}'
    );
    RestContext.request = request;
    RestContext.response = new RestResponse();

    Test.startTest();
    Account result = AccountApi.updateAccount();
    Test.stopTest();

    System.assertEquals('Updated Name', result.Name);
    System.assertEquals('555-1234', result.Phone);
    System.assertEquals(1000000, result.AnnualRevenue);
    System.assertEquals('Technology', result.Industry, 'Fields not in the payload should be left untouched');
  }
}
