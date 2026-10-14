public with sharing class DailyLeadProcessor implements Schedulable {
  public void execute(SchedulableContext context) {
    List<Lead> leads = [
      SELECT Id, Status
      FROM Lead
      where LeadSource = NULL
      limit 200
    ];

    List<Lead> leadsToUpdate = new List<Lead>();
    for (Lead l : leads) {
        l.leadSource = 'Dreamforce';
        leadsToUpdate.add(l);
    }

    update leadsToUpdate;
    }
}
