import ContaClient from '@/components/ContaClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minha conta | dopaminando',
  description: 'Seu histórico de compras puramente dopaminérgicas.',
};

export default function MinhaContaPage() {
  return (
    <div className="min-h-screen bg-surface">
      <ContaClient />
    </div>
  );
}
