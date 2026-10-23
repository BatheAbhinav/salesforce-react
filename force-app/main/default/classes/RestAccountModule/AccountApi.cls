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

  @HttpPatch
  global static Account updateAccount() {
    RestRequest req = RestContext.request;
    String recordId = req.requestURI.substringAfterLast('/');

    System.debug(recordId);

    AccountUpdateInput input = (AccountUpdateInput) JSON.deserialize(
      req.requestBody.toString(),
      AccountUpdateInput.class
    );

    Account acc = new Account(Id = recordId);
    if (input.Name != null) acc.Name = input.Name;
    if (input.Phone != null) acc.Phone = input.Phone;
    if (input.Industry != null) acc.Industry = input.Industry;
    if (input.Type != null) acc.Type = input.Type;
    if (input.Website != null) acc.Website = input.Website;
    if (input.AnnualRevenue != null) acc.AnnualRevenue = input.AnnualRevenue;
    if (input.NumberOfEmployees != null) acc.NumberOfEmployees = input.NumberOfEmployees;
    if (input.Description != null) acc.Description = input.Description;

    SObjectAccessDecision decision = Security.stripInaccessible(
      AccessType.UPDATABLE,
      new List<Account>{ acc }
    );
    update decision.getRecords();

    return [
      SELECT
        Id,
        Name,
        Phone,
        Industry,
        Type,
        Website,
        AnnualRevenue,
        NumberOfEmployees,
        Description
      FROM Account
      WHERE Id = :recordId
      LIMIT 1
    ];
  }

  global class AccountUpdateInput {
    global String Name;
    global String Phone;
    global String Industry;
    global String Type;
    global String Website;
    global Decimal AnnualRevenue;
    global Integer NumberOfEmployees;
    global String Description;
  }
}
