@isTest
private class AccountProcessorTest {

    @TestSetup
    static void setup() {
        List<Account> accounts = new List<Account>{
            new Account(Name = 'Account With Contacts'),
            new Account(Name = 'Account Without Contacts')
        };
        insert accounts;

        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < 3; i++) {
            contacts.add(new Contact(
                LastName = 'Test ' + i,
                AccountId = accounts[0].Id
            ));
        }
        insert contacts;
    }

    @isTest
    static void testCountContacts() {
        List<Id> accountIds = new List<Id>();
        for (Account a : [SELECT Id FROM Account]) {
            accountIds.add(a.Id);
        }

        Test.startTest();
        AccountProcessor.countContacts(accountIds);
        Test.stopTest(); // forces the @future method to complete

        Account withContacts = [
            SELECT Number_of_Contacts__c FROM Account
            WHERE Name = 'Account With Contacts'
        ];
        Account withoutContacts = [
            SELECT Number_of_Contacts__c FROM Account
            WHERE Name = 'Account Without Contacts'
        ];

        System.assertEquals(3, withContacts.Number_of_Contacts__c,
            'Should count all 3 contacts');
        System.assertEquals(0, withoutContacts.Number_of_Contacts__c,
            'Should be 0 when there are no contacts');
    }

    @isTest
    static void testBulk() {
        List<Account> bulkAccounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            bulkAccounts.add(new Account(Name = 'Bulk ' + i));
        }
        insert bulkAccounts;

        List<Id> ids = new List<Id>();
        for (Account a : bulkAccounts) {
            ids.add(a.Id);
        }

        Test.startTest();
        AccountProcessor.countContacts(ids);
        Test.stopTest();

        System.assertEquals(200, [
            SELECT COUNT() FROM Account
            WHERE Name LIKE 'Bulk %' AND Number_of_Contacts__c = 0
        ]);
    }
}