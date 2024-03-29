module.exports = {
	env: {
		browser: true,
		commonjs: true,
		node: true,
		es2021: true,
	},
	extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 12,
	},
	root: true,
	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
	},
	globals: {
		process: true,
	},
};
