// functions/api/pdf.js
export async function onRequestGet(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !/^https?:\/\/mp\.weixin\.qq\.com\/s/.test(url)) {
    return new Response("Bad Request: url must be a WeChat mp article link", { status: 400 });
  }

  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;

  if (!accountId || !apiToken) {
    return new Response("Server not configured: missing CF_ACCOUNT_ID / CF_API_TOKEN", {
      status: 500,
    });
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`;

  // ✅ 注意：Cloudflare 限制 gotoOptions.timeout <= 60000
  const body = {
    url,
    pdfOptions: {
      format: "a4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
      scale: 1.0,
    },
    gotoOptions: {
      waitUntil: "networkidle2",
      timeout: 60000, // <= 60000ms
    },
  };

  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const text = await r.text();
    return new Response(`Browser Rendering error: ${r.status}\n${text}`, { status: 500 });
  }

  const pdf = await r.arrayBuffer();
  const filename = "wechat.pdf";

  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Filename": filename,
      "Cache-Control": "no-store",
    },
  });
}
