public with sharing class AccountProcessor {
  @future
  public static void countContacts(List<Id> accountIds) {
    List<Account> accountsToUpdate = new List<Account>();

    for (Account acc : [
      SELECT Id, (SELECT Id FROM Contacts)
      FROM Account
      WHERE Id IN :accountIds
    ]) {
      acc.Number_of_Contacts__c = acc.Contacts.size();
      accountsToUpdate.add(acc);
    }

    update accountsToUpdate;
  }
}
