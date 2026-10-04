@RestResource(urlMapping='/opportunities/*')
global with sharing class OpportunityApi {

    @HttpGet
    global static List<Opportunity> getOpportunities() {
        List<Opportunity> opportunities = [
            SELECT Id, Name, Amount, StageName, CloseDate
            FROM Opportunity
            WITH USER_MODE
            LIMIT 200
        ];
        return opportunities;
    }
}