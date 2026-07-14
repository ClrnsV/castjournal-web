export type ExportFormat = 'Csv' | 'Json' | 'Pdf';

export interface ExportRequest {
  format: ExportFormat;
  includeAnalytics: boolean;
  speciesId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  minWeight?: number;
  maxWeight?: number;
  gearUsed?: string;
  baitUsed?: string;
  fishingMethod?: string;
  searchTerm?: string;
}