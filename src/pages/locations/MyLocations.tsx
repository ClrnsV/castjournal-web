import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { locationsApi } from '../../api/locations';
import type { Location } from '../../types/location';
import { CastDivider } from '../../components/CastDivider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  waterType: z.enum(['Freshwater', 'Saltwater', 'Brackish']),
  isPublic: z.boolean(),
});

type LocationValues = z.infer<typeof locationSchema>;

const emptyValues: LocationValues = {
  name: '', description: '', latitude: '', longitude: '', waterType: 'Freshwater', isPublic: false,
};

export function MyLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: emptyValues,
  });

  const load = () => locationsApi.getMine().then(setLocations).catch(() => {});
  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setEditingId(null);
    form.reset(emptyValues);
    setShowForm(true);
  };

  const startEdit = (l: Location) => {
    setEditingId(l.id);
    form.reset({
      name: l.name,
      description: l.description ?? '',
      latitude: l.latitude.toString(),
      longitude: l.longitude.toString(),
      waterType: l.waterType as LocationValues['waterType'],
      isPublic: l.isPublic,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    form.reset(emptyValues);
  };

  const onSubmit = async (values: LocationValues) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      latitude: parseFloat(values.latitude) || 0,
      longitude: parseFloat(values.longitude) || 0,
      waterType: values.waterType,
      isPublic: values.isPublic,
    };

    try {
      if (editingId) {
        await locationsApi.update(editingId, payload);
      } else {
        await locationsApi.create(payload);
      }
      cancelForm();
      load();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not save location.';
      form.setError('root', { message });
    }
  };

  const handleDelete = async (l: Location) => {
    if (!confirm(`Delete "${l.name}"?`)) return;
    await locationsApi.remove(l.id);
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <div><h1 className="font-heading text-2xl">My Locations</h1><CastDivider /></div>
        {!showForm && <Button onClick={startCreate}>+ Add location</Button>}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent>
            <h2 className="mt-0 font-heading text-lg">{editingId ? 'Edit location' : 'New location'}</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
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
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="waterType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Freshwater">Freshwater</SelectItem>
                          <SelectItem value="Saltwater">Saltwater</SelectItem>
                          <SelectItem value="Brackish">Brackish</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Make this location public</FormLabel>
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive" role="alert">{form.formState.errors.root.message}</p>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={cancelForm}>Cancel</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                    {editingId ? 'Save changes' : 'Save location'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {locations.map((l) => (
          <Card interactive key={l.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <strong className="block break-words">📍 {l.name}</strong>
                {l.description && <div className="text-sm text-muted-foreground">{l.description}</div>}
              </div>
               <div className="flex items-center gap-3 shrink-0">
+               <span className="text-sm text-muted-foreground whitespace-nowrap">{l.isPublic ? 'Public' : 'Private'}</span>
                <Button variant="outline" size="sm" onClick={() => startEdit(l)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(l)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {locations.length === 0 && !showForm && (
          <p className="text-muted-foreground">No locations yet — add your first fishing spot.</p>
        )}
      </div>
    </div>
  );
}