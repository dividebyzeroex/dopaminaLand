import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      error: 'HubSpot não configurado. Adicione HUBSPOT_ACCESS_TOKEN ao .env.local.',
      data: null,
    });
  }

  try {
    // 1. Fetch total contacts count (limit 0 is fast and returns total count)
    const contactsRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 0 }),
    });

    const contactsData = contactsRes.ok ? await contactsRes.json() : { total: 0 };

    // 2. Fetch deals to calculate total count, total pipeline value, and stages breakdown
    const dealsRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: ['dealstage', 'amount'],
        limit: 100, // Fetch up to 100 deals to aggregate pipeline values
      }),
    });

    const dealsData = dealsRes.ok ? await dealsRes.json() : { total: 0, results: [] };

    // 3. Fetch recent contacts (top 5 sorted by creation date descending)
    const recentRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
        properties: ['firstname', 'lastname', 'email', 'hs_lead_status', 'createdate'],
        limit: 5,
      }),
    });

    const recentData = recentRes.ok ? await recentRes.json() : { results: [] };

    // Aggregate deal values and stages
    let totalPipelineValue = 0;
    let closedWonCount = 0;
    const stageCounts: Record<string, number> = {};

    const dealsList = dealsData.results || [];
    dealsList.forEach((deal: any) => {
      const amount = parseFloat(deal.properties?.amount || '0');
      const stage = deal.properties?.dealstage || 'unknown';

      totalPipelineValue += amount;

      if (stage === 'closedwon') {
        closedWonCount++;
      }

      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    // Translate standard HubSpot deal stages
    const STAGE_TRANSLATIONS: Record<string, string> = {
      appointmentscheduled: 'Reunião Agendada 📅',
      qualifiedtobuy: 'Qualificado para Compra 🎯',
      presentationscheduled: 'Apresentação Agendada 🖥️',
      decisionmakerboughtin: 'Decisor Engajado 🤝',
      contractsent: 'Contrato Enviado 📄',
      closedwon: 'Fechado Ganho 🎉',
      closedlost: 'Fechado Perdido ❌',
      unknown: 'Desconhecido',
    };

    const pipelineFunnel = Object.keys(stageCounts).map(stage => ({
      stageId: stage,
      name: STAGE_TRANSLATIONS[stage] || stage,
      value: stageCounts[stage],
    })).sort((a, b) => b.value - a.value);

    // Format recent contacts list
    const recentContacts = (recentData.results || []).map((c: any) => ({
      id: c.id,
      name: `${c.properties?.firstname || ''} ${c.properties?.lastname || ''}`.trim() || 'Lead Sem Nome',
      email: c.properties?.email || 'N/A',
      status: c.properties?.hs_lead_status || 'OPEN',
      createdDate: c.properties?.createdate
        ? new Date(c.properties.createdate).toLocaleString('pt-BR')
        : 'N/A',
    }));

    return NextResponse.json({
      data: {
        kpis: {
          totalContacts: contactsData.total || 0,
          totalDeals: dealsData.total || dealsList.length,
          pipelineValue: totalPipelineValue,
          closedWon: closedWonCount,
        },
        pipelineFunnel,
        recentContacts,
      },
    });
  } catch (error: any) {
    console.error('HubSpot Analytics API Error:', error);
    return NextResponse.json(
      { error: error.message, data: null },
      { status: 500 }
    );
  }
}
