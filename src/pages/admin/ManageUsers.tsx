import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { adminUsersApi } from '../../api/admin/users';
import type { UserSummary } from '../../types/admin';
import type { PagedResult } from '../../types/catch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ManageUsers() {
  const [result, setResult] = useState<PagedResult<UserSummary> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminUsersApi.getAll({ searchTerm: searchTerm || undefined, page, pageSize: 20 });
      setResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      try {
        const res = await adminUsersApi.getAll({ searchTerm: searchTerm || undefined, page, pageSize: 20 });
        if (!cancelled) setResult(res);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [searchTerm, page]);

  const toggleActive = async (u: UserSummary) => {
    if (u.isActive) {
      if (!confirm(`Deactivate ${u.email}?`)) return;
      await adminUsersApi.deactivate(u.id);
    } else {
      await adminUsersApi.reactivate(u.id);
    }
    load();
  };

  const columns: ColumnDef<UserSummary>[] = [
    {
      header: 'User',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div>
            <div className="font-medium">{u.fullName ?? u.userName}</div>
            <div className="text-sm text-muted-foreground">{u.email}</div>
          </div>
        );
      },
    },
    { accessorKey: 'role', header: 'Role' },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Deactivated'}
        </Badge>
      ),
    },
    {
      header: 'Joined',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Button
            size="sm"
            variant={u.isActive ? 'destructive' : 'default'}
            onClick={() => toggleActive(u)}
          >
            {u.isActive ? 'Deactivate' : 'Reactivate'}
          </Button>
        );
      },
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
      <Input
        type="search"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        className="mb-4 max-w-xs"
      />

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

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