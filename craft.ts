export const onRequest = async (context) => {
  const { request, env } = context;

  // 1. 如果是瀏覽器的 Preflight (OPTIONS) 請求，直接放行
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // 2. 解析前端傳過來的資料與方法
    const url = new URL(request.url);
    const body = request.method !== "GET" ? await request.text() : null;

    // 🌟 這裡填入 Craft 的官方 API 網址（可以根據你的需求調整 endpoint）
    // 假設你原本是打到 https://api.craft.do/v1/spaces/你的SpaceID/documents
    // 我們可以把 Space ID 放進 Cloudflare 環境變數，或者直接寫死在這裡
    const craftUrl = `https://connect.craft.do/links/BB8aomfsYyH/api/v1`;

    // 3. 由 Cloudflare 後端代替瀏覽器發出請求 (沒有 CORS 問題)
    const craftResponse = await fetch(craftUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        // 🌟 從 Cloudflare 安全環境變數中讀取 Token，不外洩給前端
        "Authorization": `Bearer ${env.CRAFT_API_TOKEN}`, 
      },
      body: body,
    });

    const responseData = await craftResponse.text();

    // 4. 將 Craft 回傳的結果塞回給前端
    return new Response(responseData, {
      status: craftResponse.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 允許你自己的前端讀取
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
