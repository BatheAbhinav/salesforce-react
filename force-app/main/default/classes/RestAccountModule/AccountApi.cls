@RestResource(urlMapping='/accounts/*')
global with sharing class AccountApi {
  @HttpGet
  global static List<Account> getAccounts() {
    List<Account> accounts = [
      SELECT
        Id,
        Name,
        Phone,
        Industry,
        Type,
        AnnualRevenue,
        NumberOfEmployees,
        BillingCity,
        BillingState,
        BillingCountry
      FROM Account
      LIMIT 20
    ];
    return accounts;
  }
}
