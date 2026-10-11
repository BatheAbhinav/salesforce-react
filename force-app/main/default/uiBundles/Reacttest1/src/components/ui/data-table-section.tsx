import * as React from 'react';

import { cn } from '../../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

export type ColumnDef<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export type DataTableSectionProps<T> = {
  title: string;
  description?: string;
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  pageSizeOptions?: number[];
  enablePagination?: boolean;
  getRowId: (row: T) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
};

/**
 * Reusable section: title + table + limit (page size) + pagination,
 * backed by an in-memory page slice. Used for both the "Account" and
 * "Contact" sections so the table/pagination behavior stays identical
 * across the app.
 */
function DataTableSection<T>({
  title,
  description,
  columns,
  data,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  enablePagination = true,
  getRowId,
  emptyMessage = 'No results.',
  isLoading = false,
  className,
}: DataTableSectionProps<T>) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(pageSize);

  const pageCount = Math.max(1, Math.ceil(data.length / limit));

  // Keep page in range if the data set (or limit) shrinks.
  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const start = (page - 1) * limit;
  const rows = data.slice(start, start + limit);

  const pageNumbers = getPageNumbers(page, pageCount);

  return (
    <section data-slot="data-table-section" className={cn('space-y-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {enablePagination ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Rows per page
            <select
              data-slot="data-table-limit"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <Table aria-label={`${title} table`}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center whitespace-normal text-muted-foreground"
              >
                Loading…
              </TableCell>
            </TableRow>
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center whitespace-normal text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {enablePagination && pageCount > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pageCount} &middot; {data.length} results
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {pageNumbers.map((entry, i) =>
                entry === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={entry}>
                    <PaginationLink
                      href="#"
                      isActive={entry === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(entry);
                      }}
                    >
                      {entry}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(pageCount, p + 1));
                  }}
                  aria-disabled={page === pageCount}
                  className={
                    page === pageCount ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </section>
  );
}

/** Builds a compact page-number list with ellipses, e.g. 1 … 4 5 6 … 12 */
function getPageNumbers(
  current: number,
  total: number
): (number | 'ellipsis')[] {
  const delta = 1;
  const range: (number | 'ellipsis')[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('ellipsis');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('ellipsis');
  if (total > 1) range.push(total);

  return range;
}

export { DataTableSection };