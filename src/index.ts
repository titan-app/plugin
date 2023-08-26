import { Plugin, transformWithEsbuild } from 'vite';

export interface microWebPluginParams {
	styleAppendTo?: string;
	entry?: string;
}

const imagesRE = new RegExp(`\\.(png|webp|jpg|gif|jpeg|tiff|svg|bmp)($|\\?)`);

export default function RemoteModule({ styleAppendTo = 'parentNode', entry = 'packages/index.tsx' }: microWebPluginParams): Plugin {
	return {
		name: 'vite-plugin-remote-module',
		config() {
			return {
				build: {
					target: 'es2020',
					cssCodeSplit: false,
					rollupOptions: {
						// 用于控制 Rollup 尝试确保入口块与基础入口模块具有相同的导出
						preserveEntrySignatures: 'allow-extension',
						input: entry,
					},
				},
			};
		},
		transform(code, id) {
			// 修正图片资源使用绝对地址
			if (imagesRE.test(id)) {
				return {
					code: code.replace(/(export\s+default)\s+(".+")/, `$1 new URL($2, import.meta['url']).href`),
					map: null,
				};
			}
			return undefined;
		},
		async generateBundle(options, bundle) {
			let entry: string | undefined;
			const cssChunks: string[] = [];
			for (const chunkName of Object.keys(bundle)) {
				if (chunkName.includes('main') && chunkName.endsWith('.js')) {
					entry = chunkName;
				}
				if (chunkName.endsWith('.css')) {
					cssChunks.push(`./${chunkName}`);
				}
			}
			if (entry) {
				const cssChunksStr = JSON.stringify(cssChunks);

				// 修正 css 插入的位置
				const result = await transformWithEsbuild(
					`
import defineApp from './${entry}?microAppEnv';

function createLink(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.id = href;
  return link;
}

const styles = ${cssChunksStr}.map(css => createLink(new URL(css, import.meta['url'])));

defineApp.styleInject = (parentNode) => {
  styles.forEach((link) => {
    if (!document.getElementById(link.id)) {
      ${styleAppendTo}.append(link);
    }
  });
};

export default defineApp;
        `,
					'main.js',
					{ minify: true },
				);

				// 导出微量体积入口文件，配合 hash 和主应用时间戳缓存处理
				this.emitFile({
					fileName: 'main.js',
					type: 'asset',
					source: result.code,
				});
			}
		},
	};
}