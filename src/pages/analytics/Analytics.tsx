import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../api/analytics';
import type { Analytics as AnalyticsType } from '../../types/analytics';
import { CastDivider } from '../../components/CastDivider';
import { Card, CardContent } from '@/components/ui/card';

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        const res = await analyticsApi.get({});
        if (!cancelled) setData(res);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!data) return <p className="text-sm text-destructive">Could not load analytics.</p>;

  const trendData = data.monthlyTrend.map((t) => ({ label: monthLabel(t.year, t.month), count: t.count, weight: t.totalWeight }));

  return (
    <div>
      <h1 className="font-heading text-2xl">My Stats</h1>
      <CastDivider />

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
        <StatCard value={data.totalCatches} label="Total catches" />
        <StatCard value={data.totalWeight.toFixed(1)} label="Total weight (kg)" />
        <StatCard value={data.averageWeight != null ? data.averageWeight.toFixed(2) : '—'} label="Avg weight (kg)" />
        <StatCard value={data.averageLength != null ? data.averageLength.toFixed(1) : '—'} label="Avg length (cm)" />
      </div>

      {(data.personalBestByWeight || data.personalBestByLength) && (
        <div className="mb-8 grid grid-cols-2 gap-4">
          {data.personalBestByWeight && (
            <Card>
              <CardContent>
                <div className="text-sm text-muted-foreground">🏆 Personal best (weight)</div>
                <strong>{data.personalBestByWeight.speciesName}</strong>
                <div className="font-mono">{data.personalBestByWeight.weight} kg</div>
              </CardContent>
            </Card>
          )}
          {data.personalBestByLength && (
            <Card>
              <CardContent>
                <div className="text-sm text-muted-foreground">🏆 Personal best (length)</div>
                <strong>{data.personalBestByLength.speciesName}</strong>
                <div className="font-mono">{data.personalBestByLength.length} cm</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {trendData.length > 0 && (
        <Card className="mb-8">
          <CardContent>
            <h3 className="mt-0 font-heading text-lg">Catches over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="label" fontSize={12} stroke="var(--color-moss)" />
                <YAxis fontSize={12} stroke="var(--color-moss)" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--color-forest)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.topSpecies.length > 0 && (
        <Card className="mb-8">
          <CardContent>
            <h3 className="mt-0 font-heading text-lg">Top species</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topSpecies}>
                <XAxis dataKey="speciesName" fontSize={12} stroke="var(--color-moss)" />
                <YAxis fontSize={12} stroke="var(--color-moss)" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-river)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.topLocations.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="mt-0 font-heading text-lg">Top locations</h3>
            {data.topLocations.map((l) => (
              <div key={l.locationName} className="flex justify-between border-b border-border py-1.5 last:border-0">
                <span>📍 {l.locationName}</span>
                <span className="font-mono">{l.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <Card>
      <CardContent className="text-center font-mono">
        <div className="text-2xl font-bold text-primary">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}