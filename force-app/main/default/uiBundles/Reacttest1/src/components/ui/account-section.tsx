import { SObjectTableSection } from './sobject-table-section';

const ACCOUNT_FIELDS = ['Name', 'Phone', 'Industry', 'Type'];
const ACCOUNT_ORDER_BY = { Name: { order: 'ASC' } };

function AccountSection() {
  return (
    <SObjectTableSection
      title="Accounts"
      object="Account"
      fields={ACCOUNT_FIELDS}
      orderBy={ACCOUNT_ORDER_BY}
      emptyMessage="No accounts found."
    />
  );
}

export { AccountSection };
