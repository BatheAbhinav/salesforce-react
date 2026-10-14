public with sharing class AddPrimaryContact implements Queueable {
  private Contact c;
  private String BillingState;

  public AddPrimaryContact(Contact c, String BillingState) {
    this.c = c;
    this.BillingState = BillingState;
  }

  public void execute(QueueableContext context) {
    List<Account> acc = [
      SELECT Id, Name, BillingState
      FROM Account
      WHERE BillingState = :BillingState
      LIMIT 200
    ];

    List<Contact> ContactsToAdd = new List<Contact>();
    for (Account a : acc) {
      Contact clone = c.clone(false, true, false, false);
      clone.AccountId = a.Id;
      ContactsToAdd.add(clone);
    }
    insert ContactsToAdd;
  }
}
