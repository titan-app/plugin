import { Plugin } from 'vite';

export interface RemoteModuleOption {
	entry?: string;
}

export function RemoteModule({ entry = 'packages/index.tsx' }: RemoteModuleOption): Plugin {
	return {
		name: 'vite-plugin-remote-plugin',
		config(config) {
			return {
				build: {
					cssCodeSplit: false,
					rollupOptions: {
						preserveEntrySignatures: 'allow-extension',
						input: entry,
					},
					...config.build,
				},
				resolve: {
					...config.resolve,
					react: 'https://esm.sh/react@18.2.0',
					'react-dom': 'https://esm.sh/react-dom@18.2.0',
				},
			};
		},
	};
}
