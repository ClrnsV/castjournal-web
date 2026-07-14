import { useState } from 'react';
import { locationsApi } from '../api/locations';
import type { Location } from '../types/location';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WATER_TYPES = ['Freshwater', 'Saltwater', 'Brackish'] as const;

export function QuickAddLocationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (location: Location) => void;
}) {
  const [name, setName] = useState('');
  const [waterType, setWaterType] = useState<(typeof WATER_TYPES)[number]>('Freshwater');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setWaterType('Freshwater');
    setIsPublic(false);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Give it at least a name — you can fill in the rest later.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      // Quick-add: we don't ask for coordinates here, so these are placeholders
      // until the user finishes setting the location up properly on the
      // Locations page. See MyLocations.tsx for the full edit form.
      const created = await locationsApi.create({
        name: name.trim(),
        description: null,
        latitude: 0,
        longitude: 0,
        waterType,
        isPublic,
      });
      onCreated(created);
      handleOpenChange(false);
    } catch {
      setError("Couldn't save that location — try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a location</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="quick-location-name">Name</Label>
            <Input
              id="quick-location-name"
              autoFocus
              placeholder="e.g. Willow Creek Bridge"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              That's all you need for now — you can add coordinates and more detail
              on the Locations page whenever you're ready.
            </p>
          </div>

          <div>
            <Label>Water type</Label>
            <Select
              items={WATER_TYPES.map((w) => ({ value: w, label: w }))}
              value={waterType}
              onValueChange={(v) => setWaterType(v as (typeof WATER_TYPES)[number])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WATER_TYPES.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isPublic} onCheckedChange={(c) => setIsPublic(c === true)} />
            <Label className="!mt-0">Make this location public</Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Add location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}