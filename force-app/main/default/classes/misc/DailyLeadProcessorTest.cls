@isTest
public with sharing class DailyLeadProcessorTest {
  // Cron expression: runs at midnight on Jan 1, 2030 (a future date is required)
  private static final String CRON_EXP = '0 0 0 1 1 ? 2030';

  @testSetup
  static void setup() {
    List<Lead> leadsToAdd = new List<Lead>();
    for (Integer i = 0; i < 200; i++) {
      leadsToAdd.add(
        new Lead(
          FirstName = 'Test',
          LastName = 'Lead ' + i,
          Company = 'Test Company'
          // LeadSource intentionally left blank
        )
      );
    }
    insert leadsToAdd;
  }

  @isTest
  static void testScheduledJob() {
    // Sanity check: all 200 leads start with a blank LeadSource
    System.assertEquals(
      200,
      [SELECT COUNT() FROM Lead WHERE LeadSource = NULL]
    );

    Test.startTest();
    String jobId = System.schedule(
      'Daily Lead Processor Test',
      CRON_EXP,
      new DailyLeadProcessor()
    );
    Test.stopTest(); // the scheduled job executes here

    // Verify all leads were updated
    List<Lead> updated = [SELECT Id FROM Lead WHERE LeadSource = 'Dreamforce'];
    System.assertEquals(
      200,
      updated.size(),
      'All 200 leads should have LeadSource = Dreamforce'
    );

    // Verify none are left blank
    System.assertEquals(0, [SELECT COUNT() FROM Lead WHERE LeadSource = NULL]);
  }
}
