const { build } = require('esbuild');

build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	minify: false,
	platform: 'node', // for CJS
	outdir: 'dist',
	loader: {
		'.json': 'copy' // mainly for translations
	}
});
