import { SObjectTableSection } from './sobject-table-section';

const ACCOUNT_FIELDS = ['Name', 'Phone', 'Industry', 'Type'];
const ACCOUNT_ORDER_BY = { Name: { order: 'ASC' } };

function AccountSection({enableSearch = true, enablePagination = true}) {
  return (
    <SObjectTableSection
      title="Accounts"
      object="Account"
      fields={ACCOUNT_FIELDS}
      orderBy={ACCOUNT_ORDER_BY}
      emptyMessage="No accounts found."
      method="rest"
      enableSearch={enableSearch}
      enablePagination={enablePagination}
    />
  );
}

export { AccountSection };
