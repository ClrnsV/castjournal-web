import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { auditLogsApi } from '../../api/admin/auditLogs';
import type { AuditLog } from '../../types/admin';
import type { PagedResult } from '../../types/catch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AuditLogs() {
  const [result, setResult] = useState<PagedResult<AuditLog> | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const res = await auditLogsApi.getAll({ page, pageSize: 30 });
      if (!cancelled) setResult(res);
    }
    run();
    return () => { cancelled = true; };
  }, [page]);

  const columns: ColumnDef<AuditLog>[] = [
    {
      header: 'Time',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {new Date(row.original.timestamp).toLocaleString()}
        </span>
      ),
    },
    { accessorKey: 'action', header: 'Action', cell: ({ row }) => <strong>{row.original.action}</strong> },
    { header: 'By', cell: ({ row }) => row.original.userEmail ?? '—' },
    {
      header: 'On',
      cell: ({ row }) => {
        const log = row.original;
        if (!log.entityType) return '—';
        return `${log.entityType}${log.entityId ? ` (${log.entityId})` : ''}`;
      },
    },
    {
      header: 'Details',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.details ?? ''}</span>
      ),
    },
  ];

  const table = useReactTable({
    data: result?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: result?.totalPages ?? -1,
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {result && result.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {result.page} of {result.totalPages}</span>
          <Button variant="outline" disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}