import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      error: 'HubSpot não configurado. Adicione HUBSPOT_ACCESS_TOKEN ao .env.local.',
      data: null,
    });
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // Execute all HubSpot API queries in parallel for high speed
    const [contactsRes, dealsRes, recentContactsRes, companiesRes, ticketsRes] = await Promise.all([
      // 1. Total Contacts & Lifecycle breakdown
      fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          limit: 100,
          properties: ['firstname', 'lastname', 'email', 'hs_lead_status', 'lifecyclestage', 'createdate', 'company'],
        }),
      }).catch(() => null),

      // 2. Deals for pipeline, amount, stages
      fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          limit: 100,
          properties: ['dealname', 'dealstage', 'amount', 'closedate', 'createdate'],
          sorts: [{ propertyName: 'amount', direction: 'DESCENDING' }]
        }),
      }).catch(() => null),

      // 3. Recent Contacts (sorted by creation date)
      fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
          properties: ['firstname', 'lastname', 'email', 'hs_lead_status', 'lifecyclestage', 'createdate', 'jobtitle'],
          limit: 8,
        }),
      }).catch(() => null),

      // 4. Companies
      fetch('https://api.hubapi.com/crm/v3/objects/companies/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          limit: 20,
          properties: ['name', 'domain', 'industry', 'annualrevenue', 'numberofemployees'],
        }),
      }).catch(() => null),

      // 5. Tickets
      fetch('https://api.hubapi.com/crm/v3/objects/tickets/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          limit: 50,
          properties: ['subject', 'hs_ticket_priority', 'hs_pipeline_stage', 'createdate'],
        }),
      }).catch(() => null),
    ]);

    const contactsData = contactsRes?.ok ? await contactsRes.json() : { total: 0, results: [] };
    const dealsData = dealsRes?.ok ? await dealsRes.json() : { total: 0, results: [] };
    const recentContactsData = recentContactsRes?.ok ? await recentContactsRes.json() : { results: [] };
    const companiesData = companiesRes?.ok ? await companiesRes.json() : { total: 0, results: [] };
    const ticketsData = ticketsRes?.ok ? await ticketsRes.json() : { total: 0, results: [] };

    // Process Deals
    let totalPipelineValue = 0;
    let closedWonCount = 0;
    let closedWonValue = 0;
    let closedLostCount = 0;
    const stageMap: Record<string, { count: number; totalAmount: number }> = {};

    const dealsList = dealsData.results || [];
    dealsList.forEach((deal: any) => {
      const amount = parseFloat(deal.properties?.amount || '0');
      const stage = deal.properties?.dealstage || 'unknown';

      totalPipelineValue += amount;

      if (!stageMap[stage]) {
        stageMap[stage] = { count: 0, totalAmount: 0 };
      }
      stageMap[stage].count += 1;
      stageMap[stage].totalAmount += amount;

      if (stage === 'closedwon') {
        closedWonCount++;
        closedWonValue += amount;
      } else if (stage === 'closedlost') {
        closedLostCount++;
      }
    });

    const totalFinishedDeals = closedWonCount + closedLostCount;
    const winRate = totalFinishedDeals > 0 ? (closedWonCount / totalFinishedDeals) * 100 : 0;
    const avgDealSize = dealsList.length > 0 ? totalPipelineValue / dealsList.length : 0;

    // Standard HubSpot Deal Stages Map
    const STAGE_TRANSLATIONS: Record<string, { label: string; icon: string }> = {
      appointmentscheduled: { label: 'Reunião Agendada', icon: '📅' },
      qualifiedtobuy: { label: 'Qualificado p/ Compra', icon: '🎯' },
      presentationscheduled: { label: 'Apresentação Agendada', icon: '🖥️' },
      decisionmakerboughtin: { label: 'Decisor Engajado', icon: '🤝' },
      contractsent: { label: 'Contrato Enviado', icon: '📄' },
      closedwon: { label: 'Fechado Ganho', icon: '🎉' },
      closedlost: { label: 'Fechado Perdido', icon: '❌' },
      unknown: { label: 'Outros Estágios', icon: '💼' }
    };

    const pipelineFunnel = Object.entries(stageMap).map(([stage, info]) => ({
      stageId: stage,
      name: STAGE_TRANSLATIONS[stage]?.label || stage,
      icon: STAGE_TRANSLATIONS[stage]?.icon || '📌',
      count: info.count,
      amount: info.totalAmount,
    })).sort((a, b) => b.amount - a.amount);

    // Process Contacts Lifecycle Stages
    const lifecycleMap: Record<string, number> = {};
    const contactsList = contactsData.results || [];
    contactsList.forEach((c: any) => {
      const stage = c.properties?.lifecyclestage || 'lead';
      lifecycleMap[stage] = (lifecycleMap[stage] || 0) + 1;
    });

    const LIFECYCLE_TRANSLATIONS: Record<string, string> = {
      subscriber: 'Assinantes / Visitantes',
      lead: 'Leads Não Qualificados',
      marketingqualifiedlead: 'MQL (Marketing)',
      salesqualifiedlead: 'SQL (Vendas)',
      opportunity: 'Oportunidade Ativa',
      customer: 'Clientes Fechados',
      evangelist: 'Promotores / Evangelistas',
      other: 'Outros'
    };

    const lifecycleStages = Object.entries(lifecycleMap).map(([stage, count]) => ({
      stageKey: stage,
      label: LIFECYCLE_TRANSLATIONS[stage] || stage,
      count,
    })).sort((a, b) => b.count - a.count);

    // Top 5 High-Value Deals
    const topDeals = dealsList.slice(0, 5).map((d: any) => ({
      id: d.id,
      name: d.properties?.dealname || 'Negócio sem nome',
      amount: parseFloat(d.properties?.amount || '0'),
      stage: STAGE_TRANSLATIONS[d.properties?.dealstage]?.label || d.properties?.dealstage || 'Em Aberto',
      closeDate: d.properties?.closedate ? new Date(d.properties.closedate).toLocaleDateString('pt-BR') : 'Sem data'
    }));

    // Recent Contacts
    const recentContacts = (recentContactsData.results || []).map((c: any) => ({
      id: c.id,
      name: `${c.properties?.firstname || ''} ${c.properties?.lastname || ''}`.trim() || 'Lead Sem Nome',
      email: c.properties?.email || 'Sem E-mail',
      title: c.properties?.jobtitle || 'Cargo N/D',
      status: c.properties?.hs_lead_status || 'NOVO',
      stage: LIFECYCLE_TRANSLATIONS[c.properties?.lifecyclestage] || 'Lead',
      createdDate: c.properties?.createdate ? new Date(c.properties.createdate).toLocaleDateString('pt-BR') : 'Recente'
    }));

    // Companies List
    const topCompanies = (companiesData.results || []).map((comp: any) => ({
      id: comp.id,
      name: comp.properties?.name || 'Empresa Sem Nome',
      domain: comp.properties?.domain || 'n/a',
      industry: comp.properties?.industry || 'Geral',
      revenue: parseFloat(comp.properties?.annualrevenue || '0')
    }));

    return NextResponse.json({
      data: {
        kpis: {
          totalContacts: contactsData.total || contactsList.length,
          totalDeals: dealsData.total || dealsList.length,
          pipelineValue: totalPipelineValue,
          closedWonCount,
          closedWonValue,
          closedLostCount,
          winRate: Math.round(winRate * 10) / 10,
          avgDealSize: Math.round(avgDealSize),
          totalCompanies: companiesData.total || topCompanies.length,
          totalTickets: ticketsData.total || 0,
        },
        pipelineFunnel,
        lifecycleStages,
        topDeals,
        recentContacts,
        topCompanies,
      },
    });

  } catch (error: any) {
    console.error('Erro ao buscar dados do HubSpot:', error);
    return NextResponse.json(
      { error: 'Falha ao conectar à API do HubSpot.', details: error.message },
      { status: 500 }
    );
  }
}
