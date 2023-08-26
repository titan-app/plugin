import { Plugin } from 'vite';

interface microWebPluginParams {
    styleAppendTo?: string;
    entry?: string;
}
declare function RemoteModule({ styleAppendTo, entry }: microWebPluginParams): Plugin;

export { RemoteModule as default, microWebPluginParams };
