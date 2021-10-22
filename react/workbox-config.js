module.exports = {
	globDirectory: 'build/',
	globPatterns: [
		'**/*.{json,js,css,png,svg,jpg}'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'build/service-worker.js'
};