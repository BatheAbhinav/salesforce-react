import * as React from 'react';

import { querySObject, type SObjectField, type SObjectRecord } from '../../api/sobject/querySObject';
import { useAsyncData } from '../../features/search/hooks/useAsyncData';
import { DataTableSection, type ColumnDef } from './data-table-section';

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

  const selectedColumns: SObjectColumn[] =
    columns ?? fields.map((field): SObjectColumn => ({ field }));
  const tableColumns: ColumnDef<SObjectRecord>[] = selectedColumns.map((column) => ({
      key: column.field,
      header: column.header ?? toHeader(column.field),
      className: column.className,
      cell: (row) => formatValue(row[column.field]),
    }));

  if (error) {
    return <p className="text-sm text-destructive">Failed to load {title.toLowerCase()}: {error}</p>;
  }

  return (
    <DataTableSection
      title={title}
      description={description}
      columns={tableColumns}
      data={data ?? []}
      pageSize={10}
      isLoading={loading}
      getRowId={(row) => row.Id}
      emptyMessage={emptyMessage}
    />
  );
}

function formatValue(value: unknown): React.ReactNode {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export { SObjectTableSection };
