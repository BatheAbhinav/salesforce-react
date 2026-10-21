@isTest
private class AccountManagerTest {

    @isTest
    static void testGetAccount() {
        // 1. Test data: one account with two contacts
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        insert new List<Contact>{
            new Contact(FirstName = 'Jane', LastName = 'Doe', AccountId = acc.Id),
            new Contact(FirstName = 'John', LastName = 'Smith', AccountId = acc.Id)
        };

        // 2. Simulate the REST request
        RestRequest request = new RestRequest();
        request.requestUri = 'https://yourInstance.my.salesforce.com/services/apexrest/Accounts/'
                             + acc.Id + '/contacts';
        request.httpMethod = 'GET';
        RestContext.request = request;

        // 3. Call the method
        Test.startTest();
        Account result = AccountManager.getAccount();
        Test.stopTest();

        // 4. Assert
        System.assertNotEquals(null, result, 'An account should be returned');
        System.assertEquals(acc.Id, result.Id);
        System.assertEquals('Test Account', result.Name);
        System.assertEquals(2, result.Contacts.size(), 'Both contacts should be returned');
    }
}