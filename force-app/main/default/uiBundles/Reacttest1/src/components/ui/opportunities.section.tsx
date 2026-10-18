import { type SObjectRecord } from '../../lib/types';
import { SObjectTableSection, type SObjectColumn } from './sobject-table-section';

export type DateFormat = 'yyyy-mm-dd' | 'dd-mm-yyyy';

const OPPORTUNITY_FIELDS = ['Name', 'Amount', 'StageName', 'CloseDate', 'Account'];

function formatCloseDate(closeDate: unknown, dateFormat: DateFormat): string {
  if (typeof closeDate !== 'string') return '—';
  const [year, month, day] = closeDate.split('-');
  if (!year || !month || !day) return closeDate;
  return dateFormat === 'dd-mm-yyyy'
    ? `${day}-${month}-${year}`
    : `${year}-${month}-${day}`;
}

function formatAmount(amount: unknown): string {
  return typeof amount === 'number' ? `$${amount.toLocaleString()}` : '—';
}

function accountName(row: SObjectRecord): string {
  const account = row.Account as { Name?: string } | null | undefined;
  return account?.Name ?? '—';
}

export function toggleDateFormat(dateFormat: DateFormat): DateFormat {
  return dateFormat === 'yyyy-mm-dd' ? 'dd-mm-yyyy' : 'yyyy-mm-dd';
}

type OpportunitySectionProps = {
  dateFormat?: DateFormat;
  enableSearch?: boolean;
  enablePagination?: boolean;
};

function OpportunitySection({
  dateFormat = 'yyyy-mm-dd',
  enableSearch = true,
  enablePagination = true,
}: OpportunitySectionProps) {
  const columns: SObjectColumn[] = [
    { field: 'Name', header: 'Opportunity Name' },
    { field: 'Amount', cell: row => formatAmount(row.Amount) },
    { field: 'StageName', header: 'Stage' },
    {
      field: 'CloseDate',
      header: 'Close Date',
      cell: row => formatCloseDate(row.CloseDate, dateFormat),
    },
    { field: 'Account', cell: accountName },
  ];

  return (
    <SObjectTableSection
      title="Opportunities"
      object="Opportunity"
      fields={OPPORTUNITY_FIELDS}
      columns={columns}
      emptyMessage="No opportunities found."
      method="rest"
      enableSearch={enableSearch}
      enablePagination={enablePagination}
      detailPath={row => `/opportunities/${row.Id}`}
    />
  );
}

export { OpportunitySection };
