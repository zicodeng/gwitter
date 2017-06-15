var webpack = require('webpack');
var path = require('path');

var config = {
    context: path.join(__dirname, '/src'),
    entry: './app.jsx',

    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'app.js',
        publicPath: '/dist/'
    },

    module: {
        loaders: [
            {
                test: /\.js$|\.jsx$/,
                loaders: 'babel-loader',
                exclude: /node_modules/
            },
        ]
    },

    resolve: {
        extensions: [ '.jsx', '.js' ]
    }
};

module.exports = config;