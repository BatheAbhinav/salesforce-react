@RestResource(urlMapping='/opportunities/*')
global with sharing class OpportunityApi {
  @HttpGet
  global static List<Opportunity> getOpportunities() {
    List<Opportunity> opportunities = [
      SELECT
        Id,
        Name,
        Amount,
        StageName,
        CloseDate,
        Account.Name,
        Account.Industry,
        Account.AnnualRevenue
      FROM Opportunity
      LIMIT 20
    ];
    return opportunities;
  }

  @HttpPatch
  global static Opportunity updateOpportunity() {
    RestRequest req = RestContext.request;
    String recordId = req.requestURI.substringAfterLast('/');

    OpportunityUpdateInput input = (OpportunityUpdateInput) JSON.deserialize(
      req.requestBody.toString(),
      OpportunityUpdateInput.class
    );

    Opportunity opp = new Opportunity(Id = recordId);
    if (input.Name != null) opp.Name = input.Name;
    if (input.Amount != null) opp.Amount = input.Amount;
    if (input.StageName != null) opp.StageName = input.StageName;
    if (input.CloseDate != null) opp.CloseDate = input.CloseDate;

    SObjectAccessDecision decision = Security.stripInaccessible(
      AccessType.UPDATABLE,
      new List<Opportunity>{ opp }
    );
    update decision.getRecords();

    return [
      SELECT Id, Name, Amount, StageName, CloseDate
      FROM Opportunity
      WHERE Id = :recordId
      LIMIT 1
    ];
  }

  global class OpportunityUpdateInput {
    global String Name;
    global Decimal Amount;
    global String StageName;
    global Date CloseDate;
  }
}
