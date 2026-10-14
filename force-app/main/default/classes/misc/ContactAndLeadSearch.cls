public with sharing class ContactAndLeadSearch {
    public ContactAndLeadSearch() {

    }

    public static List<List<sObject>> searchContactsAndLeads(String findClause) {
        List<List<sObject>> search = [
            Find :findClause 
            IN NAME fields
            RETURNING Contact(FirstName, LastName), Lead(FirstName, LastName)
        ];
        return search;
    }
}