@RestResource(urlMapping='/opportunities/*')
global with sharing class OpportunityApi {
  @HttpGet
  global static List<Opportunity> getOpportunities() {
    //add relations
    List<Opportunity> opportunities = [
      SELECT Id, Name, Amount, StageName, CloseDate, Account.Name, Account.Industry, Account.AnnualRevenue
      FROM Opportunity
      LIMIT 5
    ];
    return opportunities;
  }
}
