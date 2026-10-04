import { useEffect, useState } from 'react';
import { ColumnDef, DataTableSection } from './data-table-section';
import { ApexClient } from '@/utils/apexClient';
// import { createDataSDK } from '@salesforce/platform-sdk';

type Opportunity = {
  Id: string;
  Name: string;
  Amount: number;
  StageName: string;
  CloseDate: string;
};

function OpportunitySection() {
  const [data, setData] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  ];

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

  if (loading) return <div>Loading opportunities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DataTableSection<Opportunity>
      title="Opportunities"
      columns={columns}
      data={data}
      getRowId={row => row.Id}
      emptyMessage="No opportunities found."
    />
  );
}

export { OpportunitySection };
