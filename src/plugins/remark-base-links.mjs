// 讓 Markdown 裡以 "/" 開頭的站內連結自動加上 base 路徑（部署到 GitHub Pages 子路徑時需要）。
import { visit } from 'unist-util-visit';

export default function remarkBaseLinks({ base = '/' } = {}) {
	const prefix = base.replace(/\/$/, '');
	return (tree) => {
		if (!prefix) return;
		visit(tree, 'link', (node) => {
			if (node.url.startsWith('/') && !node.url.startsWith('//') && !node.url.startsWith(prefix + '/')) {
				node.url = prefix + node.url;
			}
		});
	};
}
