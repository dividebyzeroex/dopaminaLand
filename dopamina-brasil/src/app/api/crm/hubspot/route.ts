import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'HubSpot access token não configurado. Adicione HUBSPOT_ACCESS_TOKEN ao .env.local.'
    }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { lead, claimData } = body;

    let email = '';
    let firstname = '';
    let lastname = '';
    let city = '';
    let address = '';
    let state = '';
    let zip = '';
    let phone = '';
    let jobtitle = '';
    let company = '';
    let description = '';
    let leadScore = 0;
    let leadStage = 'Awareness';

    if (claimData) {
      email = claimData.email;
      const name = claimData.nickname || 'Lead Dopaminado';
      const parts = name.split(' ');
      firstname = parts[0] || 'Lead';
      lastname = parts.slice(1).join(' ') || 'Dopaminado';
      city = claimData.city || '';
      address = claimData.address || '';
      state = claimData.state || '';
      zip = claimData.zip || '';
      phone = claimData.phone || '';
      jobtitle = claimData.jobtitle || '';
      company = claimData.company || '';
      description = `Reivindicou Recompensa Física: ${claimData.rewardName || 'Brinde Cyberpunk'}\nEmpresa: ${company}\nCargo: ${jobtitle}\nWhatsApp: ${phone}\nEndereço: ${address}, ${city}/${state} - CEP: ${zip}`;
    } else {
      if (!lead || !lead.id) {
        return NextResponse.json({ success: false, error: 'Lead inválido ou ausente.' }, { status: 400 });
      }
      email = lead.email && lead.email.includes('@')
        ? lead.email
        : `lead-${lead.id.substring(0, 8)}@dopaminado.com`;
      const name = lead.nickname || `Lead Dopaminado (${lead.id.substring(0, 8)})`;
      const parts = name.split(' ');
      firstname = parts[0] || 'Lead';
      lastname = parts.slice(1).join(' ') || 'Dopaminado';
      city = lead.deviceLocal ? lead.deviceLocal.split('-').pop()?.trim() || '' : '';
      description = `Intent Score B2B: ${lead.score || 0}\nEstágio: ${lead.stage || 'Awareness'}\nOrigem/Canal: ${lead.source || 'N/A'}\nProdutos no carrinho: ${lead.carts?.join(', ') || 'Nenhum'}\nProdutos visualizados: ${lead.views?.join(', ') || 'Nenhum'}\nReceita Potencial: R$ ${(lead.fakeRev || 0).toFixed(2)}`;
      leadScore = lead.score || 0;
      leadStage = lead.stage || 'Awareness';
    }

    // 1. Procurar se o contato já existe pelo e-mail
    let contactId: string | null = null;
    const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }]
      })
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.results && searchData.results.length > 0) {
        contactId = searchData.results[0].id;
      }
    }

    const properties: Record<string, string> = {
      email,
      firstname,
      lastname,
      city,
      hs_lead_status: 'OPEN',
      description
    };

    if (address) properties.address = address;
    if (state) properties.state = state;
    if (zip) properties.zip = zip;
    if (phone) properties.phone = phone;
    if (jobtitle) properties.jobtitle = jobtitle;
    if (company) properties.company = company;

    // 2. Criar ou Atualizar Contato
    if (contactId) {
      const updateRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties })
      });
      if (!updateRes.ok) {
        throw new Error(`Erro ao atualizar contato no HubSpot: ${updateRes.status}`);
      }
    } else {
      const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties })
      });
      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(`Erro ao criar contato no HubSpot: ${createRes.status} - ${errJson.message || 'Desconhecido'}`);
      }
      const createData = await createRes.json();
      contactId = createData.id;
    }

    // 3. Criar uma Nota de Atividade (Event Logs ou Recompensas) e associá-la na timeline do contato
    let noteBody = '';
    if (claimData) {
      noteBody = `<h3>🎁 RECOMPENSA FÍSICA SOLICITADA</h3><p>O lead resgatou a recompensa <strong>${claimData.rewardName || 'Brinde Cyberpunk'}</strong>!</p><p><strong>Endereço de Entrega:</strong><br>${address}<br>${city} - ${state}<br>CEP: ${zip}</p><p><strong>WhatsApp:</strong> ${phone}</p><p><strong>Cargo/Empresa:</strong> ${jobtitle} na ${company}</p>`;
    } else if (lead && lead.timeline && lead.timeline.length > 0) {
      const formattedTimeline = lead.timeline.map((item: any) => {
        let icon = '👀';
        let text = `Viu: ${item.product_name || 'Produto'}`;
        if (item.event_type === 'add_to_cart') { icon = '🛒'; text = `Carrinho: ${item.product_name || 'Produto'}`; }
        else if (item.event_type === 'fake_checkout') { icon = '⚡'; text = `Checkout R$ ${item.price_displayed?.toFixed(2)}`; }
        else if (item.event_type === 'rage_click') { icon = '💢'; text = 'Rage Click!'; }
        else if (item.event_type === 'search') { icon = '🔍'; text = `Buscou: "${item.metadata?.query || ''}"`; }
        else if (item.event_type === 'share_product') { icon = '🔗'; text = `Compartilhou: ${item.product_name}`; }
        else if (item.event_type === 'dwell_time_exceeded') { icon = '⏱️'; text = 'Tempo de leitura alto'; }
        else if (item.event_type === 'cart_abandoned') { icon = '🏃'; text = `Abandonou R$ ${item.price_displayed?.toFixed(2)}`; }

        const time = new Date(item.created_at).toLocaleTimeString('pt-BR');
        return `${icon} ${time} - ${text}`;
      }).join('<br>');

      noteBody = `<h3>Jornada do Lead Dopaminado no Site</h3><p><strong>Intent Score:</strong> ${leadScore} | <strong>Estágio:</strong> ${leadStage}</p><p><strong>Histórico de Ações:</strong><br>${formattedTimeline}</p>`;
    }

    if (contactId && noteBody) {
      const noteRes = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            hs_note_body: noteBody,
            hs_timestamp: new Date().toISOString()
          },
          associations: [{
            to: { id: contactId },
            types: [{
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202
            }]
          }]
        })
      });

      if (!noteRes.ok) {
        console.error('Falha ao associar nota de timeline no HubSpot:', await noteRes.text());
      }
    }

    return NextResponse.json({ success: true, contactId });
  } catch (error: any) {
    console.error('HubSpot Integration API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
