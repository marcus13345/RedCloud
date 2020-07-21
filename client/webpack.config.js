const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const webpack = require('webpack');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
let queue = Promise.resolve();
const yargv = require('yargs').argv;
const watch = yargv.watch && yargv.watch === 'true'
const glob = require('glob');
const log = require('signale');
const notifier = require('node-notifier');
const ICON = path.join(__dirname, 'icon.png');
const LiveReloadPlugin = require('webpack-livereload-plugin');

//these're tested, aight?
const sources = __dirname.replace(/\\/g, '/') + '/www/';
const static  = __dirname.replace(/\\/g, '/') + '/static/';
const outPath = __dirname + '/dist';


module.exports = {
	mode: 'production',
	devtool: 'source-map',
	entry: './client/www/index.js',
	performance: { hints: false },
	output: {
		filename: 'index.bundle.js',
		path: path.resolve(__dirname, 'dist')
		// publicPath: '/'
	},
	plugins: [
		// {
		// 	apply: (compiler) => {
		// 		compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
		// 			log.success('webpack compiled ', filepath);
		// 		});
		// 	}
		// },new HtmlWebpackPlugin({

		new HtmlWebpackPlugin({
			inject: true,
			cspPlugin: {
				enabled: true,
				policy: {
					'default-src': "'none'",
					'script-src': ["'self'", "http:\/\/localhost:*", "'unsafe-inline'"],
					'img-src': ["https:\/\/*:*", "http:\/\/*:*", "'self'"],
					'media-src': ["https:\/\/*:*", "http:\/\/*:*"],
					'connect-src': ["http:\/\/*:*", "ws:\/\/localhost:35729"],
					'style-src-elem': ["'self'", "'unsafe-inline'"],
					'style-src': ["'self'", "'unsafe-inline'"],
					'font-src': 'data:'
				},
				// hashEnabled: {
				// 	'script-src': true,
				// 	'style-src': true
				// },
				// nonceEnabled: {
				// 	'script-src': true,
				// 	'style-src': true
				// }
			}
		}),
		new CspHtmlWebpackPlugin({
			// 'base-uri': "'self'",
			// 'object-src': "'none'",
			// 'script-src': ["'unsafe-inline'", "'self'", "'unsafe-eval'"],
			// 'style-src': ["'unsafe-inline'", "'self'", "'unsafe-eval'"]
		}, {
			// enabled: true,
			// hashingMethod: 'sha256',
			// hashEnabled: {
			// 	'script-src': true,
			// 	'style-src': true
			// },
			// nonceEnabled: {
			// 	'script-src': true,
			// 	'style-src': true
			// }
		}),
		
		new LiveReloadPlugin({}),
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				loader: 'html-loader',
			},
			{
				test: /\.css$/i,
				use: 'css-loader',
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						// presets: ['@babel/preset-env'],
						plugins: ["transform-class-properties"]
					}
				}
			}
		],
	}
}