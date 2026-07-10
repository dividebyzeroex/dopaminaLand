import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET() {
  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  // Na Vercel, a chave privada costuma vir com \n literal que precisa ser convertido
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json({ 
      error: 'Faltam credenciais do GA4 nas variáveis de ambiente. Verifique GA_PROPERTY_ID, GA_CLIENT_EMAIL e GA_PRIVATE_KEY.' 
    }, { status: 500 });
  }

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      }
    });

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
    });

    if (!response.rows || response.rows.length === 0) {
      return NextResponse.json({ data: null });
    }

    const row = response.rows[0];
    const metricValues = row.metricValues || [];

    return NextResponse.json({
      data: {
        activeUsers: metricValues[0]?.value || '0',
        sessions: metricValues[1]?.value || '0',
        pageViews: metricValues[2]?.value || '0',
        bounceRate: (parseFloat(metricValues[3]?.value || '0') * 100).toFixed(1), // Convert to percentage
        avgSessionDuration: parseFloat(metricValues[4]?.value || '0').toFixed(0), // In seconds
      }
    });

  } catch (error: any) {
    console.error('GA4 API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
