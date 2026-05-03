/**
 * POST /api/contact — validates the form, then forwards JSON to your Google
 * Apps Script Web App URL.
 *
 * Env: GOOGLE_SHEETS_APPS_SCRIPT_URL, optional GOOGLE_APPS_SCRIPT_SECRET
 */

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (body._gotcha) return Response.json({ ok: true });

    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const phone = String(body.phone || '').trim().slice(0, 40);
    const company = String(body.company || '').trim().slice(0, 160);
    const message = String(body.message || '').trim().slice(0, 12000);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: 'A valid email is required.' },
        { status: 400 },
      );
    }
    if (message.length < 12) {
      return Response.json(
        { error: 'Please add a bit more detail (at least 12 characters).' },
        { status: 400 },
      );
    }

    const scriptUrl = process.env.GOOGLE_SHEETS_APPS_SCRIPT_URL;
    if (!scriptUrl || scriptUrl.includes('PASTE_')) {
      return Response.json(
        {
          error: 'not_configured',
          message:
            'Set GOOGLE_SHEETS_APPS_SCRIPT_URL in apps/web/.env to your /exec URL.',
        },
        { status: 503 },
      );
    }

    const forward = {
      name,
      email,
      phone,
      company,
      message,
    };
    const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;
    if (secret) forward.webhookSecret = secret;

    let r;
    try {
      r = await fetch(scriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forward),
      });
    } catch (netErr) {
      return Response.json(
        {
          error: 'Could not reach Google Apps Script.',
          message: netErr instanceof Error ? netErr.message : String(netErr),
        },
        { status: 502 },
      );
    }

    const raw = await r.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Response.json(
        {
          error: 'Unexpected response from sheet webhook (not JSON).',
          detail: raw.slice(0, 400),
        },
        { status: 502 },
      );
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return Response.json(
        {
          error: 'Unexpected response shape from sheet webhook.',
          detail: raw.slice(0, 400),
        },
        { status: 502 },
      );
    }

    if (!r.ok) {
      return Response.json(
        {
          error: parsed.error || 'Sheet webhook returned an error.',
          detail: raw.slice(0, 400),
        },
        { status: 502 },
      );
    }

    if (parsed.ok !== true) {
      return Response.json(
        {
          error:
            typeof parsed.error === 'string'
              ? parsed.error
              : 'Sheet rejected the submission.',
        },
        { status: 400 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[api/contact]', err);
    return Response.json(
      {
        error: 'contact_handler_failed',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
