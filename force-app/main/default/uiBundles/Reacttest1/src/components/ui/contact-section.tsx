import { SObjectTableSection } from './sobject-table-section';

function ContactSection({enableSearch = true, enablePagination = true}) {
  return (
    <SObjectTableSection
      title="Contacts"
      object="Contact"
      fields={['Name', 'Email', 'Phone']}
      orderBy={{ LastName: { order: 'ASC' } }}
      emptyMessage="No contacts found."
      method="rest"
      enableSearch={enableSearch}
      enablePagination={enablePagination}
    />
  );
}

export { ContactSection };
