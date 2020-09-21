const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const regeneratorRuntime = require("regenerator-runtime");

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './index.js'
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    devServer: {
        port: 4200
    },
    plugins: [
        new HtmlWebpackPlugin({
        template: './index.html'
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: '[name].[hash].css'
    })
],
module: {
    rules: [
        {
            test: /\.css$/, 
            use:[
                MiniCssExtractPlugin.loader, 
                'css-loader'
            ]
        },

        {
            test: /\.js$/, 
            exclude: /node_modules/, 
            loader: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        "@babel/preset-env"
                    ],
                    plugins: [
                        '@babel/plugin-proposal-class-properties'
                    ]
                }
            } 
        }
    ]
}

}