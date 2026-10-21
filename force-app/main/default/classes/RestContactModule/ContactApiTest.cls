@isTest
private class ContactApiTest {
  @isTest
  static void testUpdateContact() {
    Contact con = new Contact(FirstName = 'Jane', LastName = 'Doe', Title = 'Analyst');
    insert con;

    RestRequest request = new RestRequest();
    request.requestUri =
      'https://yourInstance.my.salesforce.com/services/apexrest/contacts/' + con.Id;
    request.httpMethod = 'PATCH';
    request.requestBody = Blob.valueOf(
      '{"LastName":"Smith","Email":"jane.smith@example.com","Phone":"555-5678"}'
    );
    RestContext.request = request;
    RestContext.response = new RestResponse();

    Test.startTest();
    Contact result = ContactApi.updateContact();
    Test.stopTest();

    System.assertEquals('Smith', result.LastName);
    System.assertEquals('Jane', result.FirstName, 'Fields not in the payload should be left untouched');
    System.assertEquals('jane.smith@example.com', result.Email);
    System.assertEquals('555-5678', result.Phone);
    System.assertEquals('Analyst', result.Title);
  }
}
