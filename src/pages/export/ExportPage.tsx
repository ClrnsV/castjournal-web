import { useState } from 'react';
import { exportApi } from '../../api/export';
import type { ExportFormat } from '../../types/export';
import { CastDivider } from '../../components/CastDivider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ExportPage() {
  const [format, setFormat] = useState<ExportFormat>('Csv');
  const [includeAnalytics, setIncludeAnalytics] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setIsDownloading(true);
    try {
      const { blob, fileName } = await exportApi.exportCatches({ format, includeAnalytics });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent>
          <h1 className="font-heading text-2xl">Export My Data</h1>
          <CastDivider />

          <div className="mb-4 space-y-1.5">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger id="format" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Csv">CSV</SelectItem>
                <SelectItem value="Json">JSON</SelectItem>
                <SelectItem value="Pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="includeAnalytics"
              checked={includeAnalytics}
              onCheckedChange={(checked) => setIncludeAnalytics(checked === true)}
            />
            <Label htmlFor="includeAnalytics" className="!mt-0">Include analytics summary</Label>
          </div>

          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <Button onClick={handleExport} disabled={isDownloading} className="w-full">
            {isDownloading ? 'Preparing download...' : 'Download my data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}