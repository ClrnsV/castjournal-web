import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { speciesApi } from '../../api/species';
import { adminSpeciesApi } from '../../api/admin/species';
import type { Species } from '../../types/species';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const speciesSchema = z.object({
  commonName: z.string().min(1, 'Common name is required'),
  scientificName: z.string(),
  category: z.string(),
  description: z.string(),
});

type SpeciesValues = z.infer<typeof speciesSchema>;

const emptyValues: SpeciesValues = { commonName: '', scientificName: '', category: '', description: '' };

export function ManageSpecies() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SpeciesValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues: emptyValues,
  });

  const load = () => speciesApi.getAll().then(setSpecies);
  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setEditingId(null);
    form.reset(emptyValues);
    setDialogOpen(true);
  };

  const startEdit = (s: Species) => {
    setEditingId(s.id);
    form.reset({
      commonName: s.commonName,
      scientificName: s.scientificName ?? '',
      category: s.category ?? '',
      description: s.description ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: SpeciesValues) => {
    const payload = {
      commonName: values.commonName,
      scientificName: values.scientificName || undefined,
      category: values.category || undefined,
      description: values.description || undefined,
    };
    try {
      if (editingId) await adminSpeciesApi.update(editingId, payload);
      else await adminSpeciesApi.create(payload);
      setDialogOpen(false);
      load();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not save species.';
      form.setError('root', { message });
    }
  };

  const handleDelete = async (s: Species) => {
    if (!confirm(`Delete "${s.commonName}"? This may affect existing catches.`)) return;
    await adminSpeciesApi.remove(s.id);
    load();
  };

  const columns: ColumnDef<Species>[] = [
    {
      header: 'Species',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div>
            <strong>{s.commonName}</strong>
            {s.scientificName && <span className="text-sm text-muted-foreground"> · {s.scientificName}</span>}
          </div>
        );
      },
    },
    { accessorKey: 'category', header: 'Category', cell: ({ row }) => row.original.category ?? '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => startEdit(row.original)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}>Delete</Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: species,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={startCreate}>+ Add species</Button>
      </div>

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit species' : 'New species'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="commonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Common name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scientificName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="text-sm text-destructive" role="alert">{form.formState.errors.root.message}</p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {editingId ? 'Save changes' : 'Add species'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}