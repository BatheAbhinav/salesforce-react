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

  @HttpPatch
  global static Contact updateContact() {
    RestRequest req = RestContext.request;
    String recordId = req.requestURI.substringAfterLast('/');

    ContactUpdateInput input = (ContactUpdateInput) JSON.deserialize(
      req.requestBody.toString(),
      ContactUpdateInput.class
    );

    Contact con = new Contact(Id = recordId);
    if (input.FirstName != null) con.FirstName = input.FirstName;
    if (input.LastName != null) con.LastName = input.LastName;
    if (input.Email != null) con.Email = input.Email;
    if (input.Phone != null) con.Phone = input.Phone;
    if (input.Title != null) con.Title = input.Title;

    SObjectAccessDecision decision = Security.stripInaccessible(
      AccessType.UPDATABLE,
      new List<Contact>{ con }
    );
    update decision.getRecords();

    return [
      SELECT Id, Name, FirstName, LastName, Email, Phone, Title
      FROM Contact
      WHERE Id = :recordId
      LIMIT 1
    ];
  }

  global class ContactUpdateInput {
    global String FirstName;
    global String LastName;
    global String Email;
    global String Phone;
    global String Title;
  }
}
