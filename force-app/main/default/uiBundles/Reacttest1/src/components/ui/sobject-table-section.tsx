import * as React from 'react';
import { Search } from 'lucide-react';

import { querySObject, type SObjectField, type SObjectRecord } from '../../api/sobject/querySObject';
import { useAsyncData } from '../../features/search/hooks/useAsyncData';
import { DataTableSection, type ColumnDef } from './data-table-section';
import { Input } from './input';

export type SObjectColumn = {
  field: SObjectField;
  header?: string;
  className?: string;
};

export type SObjectTableSectionProps = {
  title: string;
  description?: string;
  object: string;
  fields: SObjectField[];
  filters?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  columns?: SObjectColumn[];
  emptyMessage?: string;
};

function toHeader(field: string): string {
  return field.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function SObjectTableSection({
  title,
  description,
  object,
  fields,
  filters,
  orderBy,
  columns,
  emptyMessage,
}: SObjectTableSectionProps) {
  const { data, loading, error } = useAsyncData(
    () => querySObject({ object, fields, filters, orderBy }),
    [object, fields, filters, orderBy]
  );

  const [search, setSearch] = React.useState('');

  const selectedColumns: SObjectColumn[] =
    columns ?? fields.map((field): SObjectColumn => ({ field }));
  const tableColumns: ColumnDef<SObjectRecord>[] = selectedColumns.map((column) => ({
      key: column.field,
      header: column.header ?? toHeader(column.field),
      className: column.className,
      cell: (row) => formatValue(row[column.field]),
    }));

  const filteredData = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter((row) =>
      selectedColumns.some((column) => {
        const value = row[column.field];
        return value != null && String(value).toLowerCase().includes(term);
      })
    );
  }, [data, search, selectedColumns]);

  if (error) {
    return <p className="text-sm text-destructive">Failed to load {title.toLowerCase()}: {error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          aria-label={`Search ${title}`}
          className="pl-9"
        />
      </div>
      <DataTableSection
        title={title}
        description={description}
        columns={tableColumns}
        data={filteredData}
        pageSize={10}
        isLoading={loading}
        getRowId={(row) => row.Id}
        emptyMessage={
          search.trim() ? `No ${title.toLowerCase()} match “${search.trim()}”.` : emptyMessage
        }
      />
    </div>
  );
}

function formatValue(value: unknown): React.ReactNode {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export { SObjectTableSection };
