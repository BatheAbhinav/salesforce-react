public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(){
        // List<Contact> contacts = [
        //     Select FirstName, LastName, Email
        //     from Contact
        // ];
        // return contacts;
        throw new AuraHandledException('Forced error');
    }
}