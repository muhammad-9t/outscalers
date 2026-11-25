/**
 * The old blog (from the previous outscalers.com) is discontinued. Old post URLs answer
 * "410 Gone" so search engines drop them cleanly, with a short page linking home.
 */
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Article removed | Outscalers</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080d15;color:#eaf0f6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px}a{color:#ff9c57}</style></head><body><main><h1>This article has been removed.</h1><p>Our blog is no longer published. <a href="/">Go to the homepage</a></p></main></body></html>`;

export function GET() {
  return new Response(page, { status: 410, headers: { "content-type": "text/html; charset=utf-8" } });
}
