public with sharing class LeadProcessor implements Database.batchable<sObject> {
  public LeadProcessor() {
  }

  public Database.QueryLocator start(Database.BatchableContext bc) {
    return Database.getQueryLocator(
      'SELECT Id, Name, Email FROM Lead'
    );
  }

  public void execute(Database.BatchableContext bc, List<Lead> scope) {
    List<Lead> leadsToUpdate = new List<Lead>();
    for (Lead l : scope) {
      l.LeadSource = 'Dreamforce';
      leadsToUpdate.add(l);
    }
    update leadsToUpdate;
  }

  public void finish(Database.BatchableContext bc) {
    System.debug('Finished processing leads.');
  }
}
