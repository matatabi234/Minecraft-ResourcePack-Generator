export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 👇 ここが追加部分
    if (url.pathname === "/sitemap.xml") {
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>https://minecraft-resource-pack-generator.matatabi234.workers.dev/</loc>
<changefreq>daily</changefreq>
<priority>1.0</priority>
</url>

<url>
<loc>https://minecraft-resource-pack-generator.matatabi234.workers.dev/download.html</loc>
</url>

<url>
<loc>https://minecraft-resource-pack-generator.matatabi234.workers.dev/about.html</loc>
</url>

</urlset>`, {
        headers: {
          "Content-Type": "application/xml; charset=UTF-8"
        }
      });
    }

    // 👇 それ以外は普通に表示
    return fetch(request);
  }
};