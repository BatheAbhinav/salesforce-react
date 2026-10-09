@isTest
private class TestRestrictContactByName {

    @isTest
    static void testInsertInvalidName() {
        Contact c = new Contact(LastName = 'INVALIDNAME');

        Test.startTest();
        Database.SaveResult result = Database.insert(c, false);
        Test.stopTest();

        System.assert(!result.isSuccess(), 'Insert with invalid name should fail');
        System.assertEquals(1, result.getErrors().size());
        System.assertEquals(
            'The Last Name "INVALIDNAME" is not allowed for DML',
            result.getErrors()[0].getMessage()
        );
    }

    @isTest
    static void testInsertValidName() {
        Contact c = new Contact(LastName = 'Smith');

        Test.startTest();
        Database.SaveResult result = Database.insert(c, false);
        Test.stopTest();

        System.assert(result.isSuccess(), 'Insert with valid name should succeed');
    }

    @isTest
    static void testUpdateToInvalidName() {
        Contact c = new Contact(LastName = 'Smith');
        insert c;

        c.LastName = 'INVALIDNAME';

        Test.startTest();
        Database.SaveResult result = Database.update(c, false);
        Test.stopTest();

        System.assert(!result.isSuccess(), 'Update to invalid name should fail');
        System.assertEquals(
            'The Last Name "INVALIDNAME" is not allowed for DML',
            result.getErrors()[0].getMessage()
        );
    }

    @isTest
    static void testUpdateValidName() {
        Contact c = new Contact(LastName = 'Smith');
        insert c;

        c.LastName = 'Jones';

        Test.startTest();
        Database.SaveResult result = Database.update(c, false);
        Test.stopTest();

        System.assert(result.isSuccess(), 'Update with valid name should succeed');
    }

    @isTest
    static void testBulkInsertMixed() {
        List<Contact> contacts = new List<Contact>{
            new Contact(LastName = 'Valid1'),
            new Contact(LastName = 'INVALIDNAME'),
            new Contact(LastName = 'Valid2')
        };

        Test.startTest();
        List<Database.SaveResult> results = Database.insert(contacts, false);
        Test.stopTest();

        System.assert(results[0].isSuccess());
        System.assert(!results[1].isSuccess());
        System.assert(results[2].isSuccess());
    }
}