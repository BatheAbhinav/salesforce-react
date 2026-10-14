@isTest()
public with sharing class AddPrimaryContactTest {

    @testSetup
    static void setup() {
        List<Account> AccountsToAdd = new List<Account>();
        for(Integer i=0;i<50;i++){
            Account a = new Account();
            a.Name = 'Test Account ' + i;
            a.BillingState = 'CA';
            AccountsToAdd.add(a);

            Account b = new Account();
            b.name = 'Test Account ' + (i+50);
            b.BillingState = 'NY';
            AccountsToAdd.add(b);
        }
        insert AccountsToAdd;
    }
    
    @isTest
    static void AddPrimaryContactTest() {
        Contact c = new Contact(FirstName='Test', LastName='Contact'); 
        AddPrimaryContact job = new AddPrimaryContact(c, 'CA');

        Test.startTest();
        System.enqueueJob(job);
        Test.stopTest();

        Integer countCA = [SELECT COUNT() FROM Contact WHERE Account.BillingState = 'CA'];

        System.assertEquals(50, countCA, 'There should be 50 contacts added for CA accounts');

        Integer countNY = [SELECT COUNT() FROM Contact WHERE Account.BillingState = 'NY'];
        System.assertEquals(0, countNY, 'There should be 0 contacts added for NY accounts');
    }
}