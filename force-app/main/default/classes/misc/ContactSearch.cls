public with sharing class ContactSearch {
    public ContactSearch() {

    }

    public static Contact[] searchForContacts (String LastName, String MailingCode) {
        Contact[] contacts = [
            select id, name
            from Contact
            where LastName=:LastName AND MailingPostalCode=:MailingCode
        ];
        return contacts;
    }
}