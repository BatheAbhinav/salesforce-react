@isTest
private class LeadProcessorTest {

  @testSetup
  static void setup() {
    List<Lead> leads = new List<Lead>();
    for (Integer i = 0; i < 200; i++) {
      leads.add(new Lead(
        FirstName = 'Test',
        LastName = 'Lead ' + i,
        Company = 'Test Company ' + i,
        Email = 'testlead' + i + '@example.com',
        LeadSource = 'Web'
      ));
    }
    insert leads;
  }

  @isTest
  static void testBatchExecution() {
    Test.startTest();
    LeadProcessor processor = new LeadProcessor();
    Id batchId = Database.executeBatch(processor, 200);
    Test.stopTest();

    // Batch has completed after stopTest()
    List<Lead> updatedLeads = [
      SELECT Id, LeadSource
      FROM Lead
    ];

    System.assertEquals(200, updatedLeads.size(), 'All leads should be present');
    for (Lead l : updatedLeads) {
      System.assertEquals(
        'Dreamforce',
        l.LeadSource,
        'LeadSource should be updated to Dreamforce'
      );
    }

    AsyncApexJob job = [
      SELECT Status, NumberOfErrors, JobItemsProcessed
      FROM AsyncApexJob
      WHERE Id = :batchId
    ];
    System.assertEquals('Completed', job.Status);
    System.assertEquals(0, job.NumberOfErrors);
  }
}