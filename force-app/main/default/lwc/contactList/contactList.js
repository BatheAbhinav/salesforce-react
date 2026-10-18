import { LightningElement, wire } from "lwc";
import getContacts from "@salesforce/apex/ContactController.getContacts";
import FIRSTNAME_FIELD from "@salesforce/schema/Contact.FirstName";
import LASTNAME_FIELD from "@salesforce/schema/Contact.LastName";
import EMAIL_FIELD from "@salesforce/schema/Contact.Email";
import { reduceErrors } from 'c/ldsUtils';

const COLUMNS = [
  { label: "FirstName", fieldName: FIRSTNAME_FIELD.fieldApiName },
  { label: "LastName", fieldName: LASTNAME_FIELD.fieldApiName },
  { label: "Email", fieldName: EMAIL_FIELD.fieldApiName }
];

export default class ContactList extends LightningElement {
  columns = COLUMNS;
  @wire(getContacts)
  contacts;

  get errors(){
    return this.contacts.errors ? reduceErrors(this.contacts.errors) : [];
  }
}
