import { SObjectTableSection } from './sobject-table-section';

function ContactSection() {
  return (
    <SObjectTableSection
      title="Contacts"
      object="Contact"
      fields={['Name', 'Email', 'Phone']}
      orderBy={{ LastName: { order: 'ASC' } }}
      emptyMessage="No contacts found."
      method="rest"
    />
  );
}

export { ContactSection };
