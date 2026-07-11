import { NextResponse } from 'next/server';

interface HogQLResult {
  columns: string[];
  results: any[][];
}

async function runHogQLQuery(query: string): Promise<HogQLResult | null> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!apiKey || !projectId) return null;

  const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: { kind: 'HogQLQuery', query },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`PostHog HogQL error (${res.status}):`, errText);
    return null;
  }

  const json = await res.json();
  return { columns: json.columns || [], results: json.results || [] };
}

export async function GET() {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    return NextResponse.json({
      error: 'PostHog não configurado. Adicione POSTHOG_PERSONAL_API_KEY e POSTHOG_PROJECT_ID ao .env.local.',
      data: null,
    });
  }

  try {
    // Run all queries in parallel for speed
    const [
      pageviewsByDay,
      topEvents,
      sessionStats,
      topPages,
      topCities,
      topReferrers,
      topBrowsers,
      deviceTypes,
    ] = await Promise.all([
      // 1. Pageviews por dia (30d)
      runHogQLQuery(`
        SELECT
          toDate(timestamp) AS day,
          count() AS total
        FROM events
        WHERE event = '$pageview'
          AND timestamp > now() - INTERVAL 30 DAY
        GROUP BY day
        ORDER BY day ASC
      `),

      // 2. Top 10 eventos (excluindo internos)
      runHogQLQuery(`
        SELECT
          event,
          count() AS total
        FROM events
        WHERE timestamp > now() - INTERVAL 30 DAY
          AND event NOT LIKE '$%'
        GROUP BY event
        ORDER BY total DESC
        LIMIT 10
      `),

      // 3. Sessões únicas e total de pageviews (7d e 30d)
      runHogQLQuery(`
        SELECT
          uniqExact(properties.$session_id) AS sessions_30d,
          count() AS pageviews_30d,
          uniqExactIf(properties.$session_id, timestamp > now() - INTERVAL 7 DAY) AS sessions_7d,
          countIf(timestamp > now() - INTERVAL 7 DAY) AS pageviews_7d
        FROM events
        WHERE event = '$pageview'
          AND timestamp > now() - INTERVAL 30 DAY
      `),

      // 4. Top 10 páginas mais visitadas
      runHogQLQuery(`
        SELECT
          properties.$current_url AS url,
          count() AS views
        FROM events
        WHERE event = '$pageview'
          AND timestamp > now() - INTERVAL 30 DAY
        GROUP BY url
        ORDER BY views DESC
        LIMIT 10
      `),

      // 5. Top 10 cidades
      runHogQLQuery(`
        SELECT
          properties.$geoip_city_name AS city,
          properties.$geoip_country_code AS country,
          count() AS total
        FROM events
        WHERE event = '$pageview'
          AND timestamp > now() - INTERVAL 30 DAY
          AND city IS NOT NULL
          AND city != ''
        GROUP BY city, country
        ORDER BY total DESC
        LIMIT 10
      `),

      // 6. Top 10 referrers
      runHogQLQuery(`
        SELECT
          properties.$referring_domain AS referrer,
          count() AS total
        FROM events
        WHERE event = '$pageview'
          AND timestamp > now() - INTERVAL 30 DAY
          AND referrer IS NOT NULL
          AND referrer != ''
          AND referrer != '$direct'
        GROUP BY referrer
        ORDER BY total DESC
        LIMIT 10
      `),

      // 7. Top browsers
      runHogQLQuery(`
        SELECT
          properties.$browser AS browser,
          count() AS total
        FROM events
        WHERE event = '$pageview'
          AND timestamp > now() - INTERVAL 30 DAY
          AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY total DESC
        LIMIT 6
      `),

      // 8. Device types (Mobile vs Desktop vs Tablet)
      runHogQLQuery(`
        SELECT
          properties.$device_type AS device,
          count() AS total
        FROM events
        WHERE event = '$pageview'
          AND timestamp > now() - INTERVAL 30 DAY
          AND device IS NOT NULL
        GROUP BY device
        ORDER BY total DESC
      `),
    ]);

    // Format results
    const formatRows = (result: HogQLResult | null) => {
      if (!result || !result.results) return [];
      return result.results.map(row => {
        const obj: Record<string, any> = {};
        result.columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
    };

    const stats = sessionStats?.results?.[0];

    return NextResponse.json({
      data: {
        // KPIs
        kpis: {
          pageviews30d: stats?.[1] || 0,
          sessions30d: stats?.[0] || 0,
          pageviews7d: stats?.[3] || 0,
          sessions7d: stats?.[2] || 0,
        },

        // Pageviews trend (30d)
        pageviewsByDay: formatRows(pageviewsByDay).map(r => ({
          date: r.day,
          pageviews: Number(r.total),
        })),

        // Top events (custom)
        topEvents: formatRows(topEvents).map(r => ({
          name: r.event,
          count: Number(r.total),
        })),

        // Top pages
        topPages: formatRows(topPages).map(r => ({
          url: r.url,
          views: Number(r.views),
        })),

        // Geography
        topCities: formatRows(topCities).map(r => ({
          city: r.city,
          country: r.country,
          count: Number(r.total),
        })),

        // Referrers
        topReferrers: formatRows(topReferrers).map(r => ({
          domain: r.referrer,
          count: Number(r.total),
        })),

        // Browsers
        topBrowsers: formatRows(topBrowsers).map(r => ({
          name: r.browser,
          count: Number(r.total),
        })),

        // Device types
        deviceTypes: formatRows(deviceTypes).map(r => ({
          type: r.device,
          count: Number(r.total),
        })),
      },
    });
  } catch (error: any) {
    console.error('PostHog API Error:', error);
    return NextResponse.json(
      { error: error.message, data: null },
      { status: 500 }
    );
  }
}
