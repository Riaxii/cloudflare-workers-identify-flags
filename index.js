export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const country = (request.cf?.country || "US").toUpperCase();
    const email = request.headers.get("cf-access-authenticated-user-email") || "user@example.com";
    const timestamp = new Date().toLocaleString();

    // Part 1: Identity Information
    if (url.pathname === "/secure") {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <p>${email} authenticated at ${timestamp} from 
            <a href="/flags/${country}">${country}</a></p>
          </body>
        </html>`;
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    // Part 2: R2 Flag Endpoint
    if (url.pathname.startsWith("/flags/")) {
      const code = url.pathname.split("/")[2].toLowerCase();
      const object = await env.FLAGS_BUCKET.get(`${code}.png`);
      if (!object) return new Response("Flag not found in R2", { status: 404 });
      
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Content-Type", "image/png");
      return new Response(object.body, { headers });
    }

    // Part 3: D1 Flag Endpoint
    if (url.pathname.startsWith("/flags-d1/")) {
      const code = url.pathname.split("/")[2].toLowerCase();
      const row = await env.DB.prepare("SELECT image FROM flags WHERE country = ?")
        .bind(code).first();
      if (!row) return new Response("Flag not found in D1", { status: 404 });
      
      return new Response(row.image, { headers: { "Content-Type": "image/png" } });
    }

    return new Response("Worker is active. Try /secure", { status: 200 });
  }
};