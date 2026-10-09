import { useEffect, useState } from 'react';
import { ColumnDef, DataTableSection } from './data-table-section';
import { ApexClient } from '@/utils/apexClient';
import { Input } from './input';
import { title } from 'process';
import { Search } from 'lucide-react';
import React from 'react';
// import { SObjectColumn } from './sobject-table-section';
import { SObjectField } from '@/api/sobject/querySObject';
// import { createDataSDK } from '@salesforce/platform-sdk';

type Opportunity = {
  Id: string;
  Name: string;
  Amount: number;
  StageName: string;
  CloseDate: string;
  Account: any;
  field?: SObjectField;
};

const apexClient = new ApexClient();

const columns: ColumnDef<Opportunity>[] = [
  { key: 'Name', header: 'Opportunity Name', cell: row => row.Name },
  {
    key: 'Amount',
    header: 'Amount',
    cell: row => `$${row.Amount.toLocaleString()}`,
  },
  { key: 'StageName', header: 'Stage', cell: row => row.StageName },
  { key: 'CloseDate', header: 'Close Date', cell: row => row.CloseDate },
  { key: 'Account', header: 'Account', cell: row => row.Account.Name },
];

function OpportunitySection() {
  const [data, setData] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apexClient
      .callApexMethod<Opportunity[]>('opportunities')
      .then(data => {
        console.log('Fetched opportunities data:', data);
        setData(data);
      })
      .catch(err => {
        console.error('Error fetching opportunities:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredData = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(row =>
      columns.some(column => {
        const value = row[column.key as keyof Opportunity];
        return value != null && String(value).toLowerCase().includes(term);
      })
    );
  }, [data, search]);

  if (loading) return <div>Loading opportunities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="relative max-w-sm">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search 'Opportunities'...`}
          aria-label={`Search ${title}`}
          className="pl-9"
        />
      </div>
      <DataTableSection<Opportunity>
        title="Opportunities"
        columns={columns}
        data={filteredData}
        getRowId={row => row.Id}
        emptyMessage="No opportunities found."
      />
    </div>
  );
}

export { OpportunitySection };
