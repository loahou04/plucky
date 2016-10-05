var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		pluckyui: ['babel-polyfill', 'whatwg-fetch', './web/js/index.js']
	},
	output: {
		path: path.join(__dirname, 'web'),
		filename: '[name]-[hash].js',
		libraryTarget: 'umd',
		publicPath: '/'
	},
	devServer: {
		hot: true,
		stats: {
			colors: true
		},
		progress: true
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Plucky',
			template: './web/template/index.html'
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'default')
		}),
	],
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel',
			query: {
				presets: ['es2015', 'react']
			}
		}, {
			test: /\.scss$/,
			loaders: ['style', 'css', 'sass'] // sass -> css -> javascript -> inline style
		}]
	},
	devServer: {
		historyApiFallback: true// 404s will return index.html in webpack dev server
	}
};
