module.exports = {
	'env': {
		'commonjs': true,
		'es2021': true,
		'node': true,
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 13,
	},
	'rules': {
		'indent': [
			'error',
			'tab',
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		'quotes': [
			'error',
			'single',
		],
		'semi': [
			'error',
			'never',
		],
		'array-bracket-spacing': [
			'warn',
			'never',
		],
		'object-curly-spacing': [
			'warn',
			'always',
		],
	},
}
