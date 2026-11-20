/* eslint-disable @typescript-eslint/no-explicit-any */
// Formato devolvido por /api/analytics/posthog e /api/analytics/hubspot.
export interface PostHogData {
  kpis: any;
  pageviewsByDay: any[];
  deviceTypes: any[];
  topReferrers: any[];
  topPages: any[];
  topEvents: any[];
  topBrowsers: any[];
  topCities: any[];
  eventsOverview?: any[];
  dailyTrends?: any[];
  funnel?: any[];
  trends?: any[];
  retention?: any[];
}

export interface HubSpotCrmData {
  kpis: {
    totalContacts: number;
    totalDeals: number;
    pipelineValue: number;
    closedWonCount: number;
    closedWonValue: number;
    closedLostCount: number;
    winRate: number;
    avgDealSize: number;
    totalCompanies: number;
    totalTickets: number;
  };
  pipelineFunnel: Array<{ stageId: string; name: string; icon: string; count: number; amount: number }>;
  lifecycleStages: Array<{ stageKey: string; label: string; count: number }>;
  topDeals: Array<{ id: string; name: string; amount: number; stage: string; closeDate: string }>;
  recentContacts: Array<{ id: string; name: string; email: string; title: string; status: string; stage: string; createdDate: string }>;
  topCompanies?: Array<{ id: string; name: string; domain: string; industry: string; revenue: number }>;
}
