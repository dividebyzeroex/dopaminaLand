import LootBox from '@/components/LootBox';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caixa Misteriosa 📦 — Dopamina Brasil',
  description: 'Abra uma caixa misteriosa e descubra itens de diferentes raridades. De capinhas a ilhas privadas.',
};

export default function LootBoxPage() {
  return <LootBox />;
}
