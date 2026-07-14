import type { Catch } from './catch';

export interface SpeciesBreakdown {
  speciesName: string;
  count: number;
  totalWeight: number;
}

export interface LocationBreakdown {
  locationName: string;
  count: number;
}

export interface MethodBreakdown {
  method: string;
  count: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  count: number;
  totalWeight: number;
}

export interface Analytics {
  totalCatches: number;
  totalWeight: number;
  averageWeight: number | null;
  averageLength: number | null;
  personalBestByWeight: Catch | null;
  personalBestByLength: Catch | null;
  topSpecies: SpeciesBreakdown[];
  topLocations: LocationBreakdown[];
  methodBreakdown: MethodBreakdown[];
  monthlyTrend: MonthlyTrend[];
}

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
}