public with sharing class RandomContactFactory {
  public RandomContactFactory() {
  }

  public static List<Contact> generateRandomContacts(Integer count, String LastName) {
    List<Contact> contactToInsert = new List<Contact>();
    for(Integer i=0;i<count;i++) {
        Contact c = new Contact();
        c.FirstName = 'Test' + i;
        c.LastName = LastName;

        contactToInsert.add(c);
    }

    // insert contactToInsert;
    return contactToInsert;
  }
}
