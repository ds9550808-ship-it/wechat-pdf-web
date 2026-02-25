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
    return new Response("Server not configured: missing CF_ACCOUNT_ID / CF_API_TOKEN", { status: 500 });
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`;

  const body = {
    // Cloudflare 这里要求 url 或 html 二选一
    url,
    pdfOptions: {
      format: "a4",                 // 必须小写
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    },
    gotoOptions: {
      waitUntil: "networkidle2",    // Cloudflare 接受 networkidle0/networkidle2/domcontentloaded/load
      timeout: 60000,
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

  const textIfFail = !r.ok ? await r.text() : null;
  if (!r.ok) {
    return new Response(`Browser Rendering error: ${r.status}\n${textIfFail}`, { status: 500 });
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
