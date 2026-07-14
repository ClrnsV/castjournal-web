import { useEffect, useState } from 'react';
import { reportsApi } from '../../api/admin/reports';
import type { SystemReport, ReportType } from '../../types/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function SystemReports() {
  const [type, setType] = useState<ReportType>('UserActivity');
  const [report, setReport] = useState<SystemReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      try {
        const res = await reportsApi.get({ type, topCount: 5 });
        if (!cancelled) setReport(res);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [type]);

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(['UserActivity', 'CatchActivity', 'SpeciesOverview'] as ReportType[]).map((t) => (
          <Button key={t} variant={type === t ? 'default' : 'outline'} onClick={() => setType(t)}>
            {t.replace(/([A-Z])/g, ' $1').trim()}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && report && !report.hasData && (
        <p className="text-muted-foreground">{report.message ?? 'No data available.'}</p>
      )}

      {report?.userActivity && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
          <StatCard label="Total users" value={report.userActivity.totalUsers} />
          <StatCard label="Active" value={report.userActivity.activeUsers} />
          <StatCard label="Inactive" value={report.userActivity.inactiveUsers} />
          <StatCard label="New this period" value={report.userActivity.newUsersInPeriod} />
          <StatCard label="Admins" value={report.userActivity.adminCount} />
        </div>
      )}

      {report?.catchActivity && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
          <StatCard label="Total catches (all time)" value={report.catchActivity.totalCatchesAllTime} />
          <StatCard label="Catches this period" value={report.catchActivity.totalCatchesInPeriod} />
          <StatCard label="Total weight (kg)" value={report.catchActivity.totalWeightInPeriod.toFixed(1)} />
        </div>
      )}

      {report?.speciesOverview && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
          <StatCard label="Total species" value={report.speciesOverview.totalSpecies} />
          <StatCard label="Approved" value={report.speciesOverview.approvedSpecies} />
          <StatCard label="Pending" value={report.speciesOverview.pendingSpecies} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="text-center font-mono">
        <div className="text-2xl font-bold text-primary">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}