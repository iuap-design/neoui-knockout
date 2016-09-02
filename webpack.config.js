var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var env = require('yargs').argv.mode;



var libraryName = 'neoui-knockout';

var plugins = [],
	outputFile,
    server = {};

if(env === 'build') {
	plugins.push(new UglifyJsPlugin({
		minimize: true
	}));
	outputFile = libraryName + '.min.js';
} else if (env === 'exam') {
    server = {
     publicPath: "/static/",
     stats: { colors: true },
     port: 8080,
     contentBase: "./examples",
     inline: true
    }
} else {
	outputFile = libraryName + '.js';
}

var config = {
	entry: __dirname + '/src/index.js',
	// devtool: 'source-map',
	output: {
		path: __dirname + '/dist',
		filename: outputFile,
		//library: 'u',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
    devServer: server,
    modules: {
		loaders: [
			{
				test: /\.html$/,
				loader: 'html-loader'
			}
		]
	},
	resolve: {
		root: path.resolve('./js'),
		extensions: ['', '.js', '.html']
	},
	plugins: plugins
};

module.exports = config;
