// 檢查建置後網站（dist/）的站內連結：連到的頁面要存在，#錨點也要存在。
// 用法：node scripts/check-links.mjs [dist 目錄]
// base 路徑的推法和 astro.config.mjs 相同（BASE_PATH 或 GITHUB_REPOSITORY），所以要和建置時用同樣的環境變數。
// 有壞連結時以結束碼 1 結束，讓 GitHub Actions 的建置失敗。
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const repo = (process.env.GITHUB_REPOSITORY ?? '').split('/')[1];
const base = (process.env.BASE_PATH ?? (repo ? `/${repo}` : '')).replace(/\/$/, '');

async function* htmlFiles(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* htmlFiles(path);
		else if (entry.name.endsWith('.html')) yield path;
	}
}

const decode = (s) => {
	try {
		return decodeURIComponent(s);
	} catch {
		return s;
	}
};
const unescape = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// 網址 → { html, ids }
const pages = new Map();
for await (const file of htmlFiles(dist)) {
	const rel = '/' + relative(dist, file).split(sep).join('/');
	const url = base + (rel.endsWith('index.html') ? rel.slice(0, -'index.html'.length) : rel);
	const html = await readFile(file, 'utf8');
	const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => decode(unescape(m[1]))));
	pages.set(url, { html, ids });
}

let broken = 0;
for (const [url, { html }] of pages) {
	// 只檢查正文；側欄與頁首由 Starlight 產生
	const main = html.split('<main').slice(1).join('<main');
	for (const [, raw] of main.matchAll(/href="([^"]+)"/g)) {
		const href = unescape(raw);
		if (/^(https?:|mailto:|\/\/)/.test(href) || href === '#') continue;
		let path, frag;
		if (href.startsWith('#')) [path, frag] = [url, href.slice(1)];
		else if (href.startsWith('/')) {
			[path, frag = ''] = href.split('#');
			if (/\.(css|js|svg|xml|png|jpg|webp|ico)$/.test(path) || path.includes('/_astro/')) continue;
			if (!path.endsWith('/')) path += '/';
		} else continue;
		const target = pages.get(decode(path));
		if (!target) {
			console.log(`找不到頁面  ${url} → ${href}`);
			broken++;
		} else if (frag && !target.ids.has(decode(frag))) {
			console.log(`找不到錨點  ${url} → ${decode(href)}`);
			broken++;
		}
	}
}

console.log(`檢查了 ${pages.size} 個頁面（base: ${base || '/'}），壞連結 ${broken} 個`);
if (pages.size === 0) {
	console.log(`在 ${dist} 找不到任何 HTML，請先執行 npm run build`);
	process.exit(1);
}
process.exit(broken ? 1 : 0);
