import { Metadata } from 'next';
import AnalyticsDashboardClient from '@/components/AnalyticsDashboardClient';

export const metadata: Metadata = {
  title: 'Insights | Dopamina Land',
  description: 'Analytics de Intenções de Compra.',
};

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <AnalyticsDashboardClient />
    </div>
  );
}
