"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => RemoteModule
});
module.exports = __toCommonJS(src_exports);
var import_vite = require("vite");
var imagesRE = new RegExp(`\\.(png|webp|jpg|gif|jpeg|tiff|svg|bmp)($|\\?)`);
function RemoteModule({ styleAppendTo = "parentNode", entry = "packages/index.tsx" }) {
  return {
    name: "vite-plugin-remote-module",
    config() {
      return {
        build: {
          target: "es2020",
          cssCodeSplit: false,
          rollupOptions: {
            // 用于控制 Rollup 尝试确保入口块与基础入口模块具有相同的导出
            preserveEntrySignatures: "allow-extension",
            input: entry
          }
        }
      };
    },
    transform(code, id) {
      if (imagesRE.test(id)) {
        return {
          code: code.replace(/(export\s+default)\s+(".+")/, `$1 new URL($2, import.meta['url']).href`),
          map: null
        };
      }
      return void 0;
    },
    async generateBundle(options, bundle) {
      let entry2;
      const cssChunks = [];
      for (const chunkName of Object.keys(bundle)) {
        if (chunkName.includes("main") && chunkName.endsWith(".js")) {
          entry2 = chunkName;
        }
        if (chunkName.endsWith(".css")) {
          cssChunks.push(`./${chunkName}`);
        }
      }
      if (entry2) {
        const cssChunksStr = JSON.stringify(cssChunks);
        const result = await (0, import_vite.transformWithEsbuild)(
          `
import defineApp from './${entry2}?microAppEnv';

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
          "main.js",
          { minify: true }
        );
        this.emitFile({
          fileName: "main.js",
          type: "asset",
          source: result.code
        });
      }
    }
  };
}
