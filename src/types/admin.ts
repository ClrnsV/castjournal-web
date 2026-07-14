export interface UserSummary {
  id: string;
  userName: string | null;
  email: string | null;
  fullName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface CreateUserPayload {
  userName: string;
  email: string;
  password: string;
  fullName?: string;
  role: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: string;
}

export interface UserFilter {
  searchTerm?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export type ReportType = 'UserActivity' | 'CatchActivity' | 'SpeciesOverview';

export interface TopAngler {
  userId: string;
  userName: string | null;
  email: string | null;
  catchCount: number;
}

export interface UserActivityReport {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersInPeriod: number;
  adminCount: number;
  regularUserCount: number;
  mostActiveUsers: TopAngler[];
}

export interface SpeciesBreakdownEntry {
  speciesName: string;
  count: number;
}

export interface CatchActivityReport {
  totalCatchesAllTime: number;
  totalCatchesInPeriod: number;
  totalWeightInPeriod: number;
  averageWeightInPeriod: number | null;
  topSpecies: SpeciesBreakdownEntry[];
  topAnglers: TopAngler[];
  monthlyTrend: { year: number; month: number; count: number }[];
}

export interface SpeciesOverviewReport {
  totalSpecies: number;
  approvedSpecies: number;
  pendingSpecies: number;
  mostCaughtSpecies: SpeciesBreakdownEntry[];
  speciesNeverCaught: string[];
}

export interface SystemReport {
  reportType: string;
  generatedAt: string;
  hasData: boolean;
  message: string | null;
  userActivity: UserActivityReport | null;
  catchActivity: CatchActivityReport | null;
  speciesOverview: SpeciesOverviewReport | null;
}

export interface SystemReportFilter {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  topCount?: number;
}