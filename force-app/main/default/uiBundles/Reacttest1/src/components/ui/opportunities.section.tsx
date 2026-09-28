import { useEffect, useState } from 'react';
import { ColumnDef, DataTableSection } from './data-table-section';
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

  const [search, setSearch] = useState('');

  const baseUrl = import.meta.env.VITE_SFDC_BASE_URL;
  const accessToken = import.meta.env.VITE_SFDC_ACCESS_TOKEN;

  const url = `${baseUrl}/opportunities`;
  const token = `${accessToken}`;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const json = await response.json();
        console.log('Fetched opportunities data:', json);
        setData(json);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

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
