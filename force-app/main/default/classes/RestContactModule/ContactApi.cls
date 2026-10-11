@RestResource(urlMapping='/contacts/*')
global with sharing class ContactApi {
    @HttpGet
  global static List<Contact> getContacts() {
    List<Contact> contacts = [
      SELECT Id, Name, Email, Phone
      FROM Contact
      LIMIT 20
    ];
    return contacts;
  }
}
