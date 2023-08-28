import { resolve } from 'path';
import { Plugin } from 'vite';

export interface RemoteModuleOption {
	entry?: string;
}

export function RemoteModule({ entry = 'packages/index.tsx' }: RemoteModuleOption): Plugin {
	return {
		name: 'vite-plugin-remote-plugin',
		apply: 'build',
		config(config) {
			return {
				build: {
					...config.build,
					cssCodeSplit: false,
					rollupOptions: {
						...config.build?.rollupOptions,
						preserveEntrySignatures: 'allow-extension',
						input: resolve(entry),
					},
				},
				resolve: {
					alias: {
						...config.resolve?.alias,
						react: 'https://esm.sh/react@18.2.0',
						'react-dom': 'https://esm.sh/react-dom@18.2.0',
					},
				},
			};
		},
		configResolved(c) {
			console.log(c.resolve.alias);
		},
	};
}
