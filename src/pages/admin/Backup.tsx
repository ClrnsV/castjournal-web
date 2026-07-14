import { useState } from 'react';
import { backupApi } from '../../api/admin/backup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Backup() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const { blob, fileName } = await backupApi.export();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>System Backup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Downloads a full JSON snapshot of the database.
        </p>
        <Button onClick={handleExport} disabled={isDownloading}>
          {isDownloading ? 'Preparing...' : 'Download backup'}
        </Button>
      </CardContent>
    </Card>
  );
}