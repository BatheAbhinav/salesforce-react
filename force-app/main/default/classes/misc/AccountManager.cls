@RestResource(urlMapping='/Accounts/*/contacts')
global with sharing class AccountManager {
  @HttpGet
  global static Account getAccount() {
    RestRequest req = RestContext.request;
    String accId = req.requestURI.substringBetween('Accounts/', '/contacts');

    Account result = [
      SELECT Id, Name, (SELECT Id, Name FROM Contacts)
      FROM Account
      WHERE Id = :accId
      LIMIT 1
    ];
    return result;
  }
}
