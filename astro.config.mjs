// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkBaseLinks from './src/plugins/remark-base-links.mjs';

// GitHub Actions 會提供 GITHUB_REPOSITORY（owner/repo），用來推出 GitHub Pages 的網址與子路徑。
// 本機開發時兩者皆未設定，網站就掛在根目錄。
const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const site = process.env.SITE_URL ?? (owner ? `https://${owner}.github.io` : undefined);
const base = process.env.BASE_PATH ?? (repo ? `/${repo}` : '/');

export default defineConfig({
	site,
	base,
	markdown: {
		remarkPlugins: [[remarkBaseLinks, { base }]],
	},
	integrations: [
		starlight({
			title: '價值與實踐 · 讀書筆記',
			description: '清大通識「價值與實踐」的課程講義與課堂筆記整理：倫理學理論、道德懷疑論與存在主義。',
			defaultLocale: 'root',
			locales: { root: { label: '繁體中文', lang: 'zh-TW' } },
			customCss: ['./src/styles/custom.css'],
			lastUpdated: false,
			sidebar: [
				{
					label: '開始',
					items: [
						{ label: '首頁', link: '/' },
						{ label: '課程總覽', slug: 'course/syllabus' },
					],
				},
				{
					label: '一、價值',
					items: [{ slug: 'value/what-is-value' }],
				},
				{
					label: '二、規範倫理學',
					items: [
						{ slug: 'ethics/map' },
						{ slug: 'ethics/egoism' },
						{ slug: 'ethics/altruism' },
						{ slug: 'ethics/utilitarianism' },
						{ slug: 'ethics/kant' },
					],
				},
				{
					label: '三、德行與情感',
					items: [{ slug: 'critique/virtue' }, { slug: 'critique/sentiment' }],
				},
				{
					label: '四、對道德的懷疑',
					items: [
						{ slug: 'skepticism/doubting-morality' },
						{ slug: 'skepticism/existentialism' },
						{ slug: 'skepticism/phenomenology' },
					],
				},
				{
					label: '考前複習',
					items: [
						{ slug: 'review/compare' },
						{ slug: 'review/essay-practice' },
						{ slug: 'review/glossary' },
					],
				},
			],
		}),
	],
});
