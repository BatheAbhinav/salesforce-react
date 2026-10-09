trigger ClosedOpportunityTrigger on Opportunity(after insert, after update) {
  List<Task> tasksToInsert = new List<Task>();

  for (Opportunity o : Trigger.new) {
    if (o.StageName == 'Closed Won') {
      Task t = new Task(
        subject = 'Follow Up Test Task',
        WhatId = o.Id
      );
      tasksToInsert.add(t);
    }
  }

  insert tasksToInsert;
}
