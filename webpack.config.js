const path = require('path')

module.exports = {
    watch: true,
    mode: 'development',
    entry: "./public/main.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js",
        publicPath: "./dist/"
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [{
            test: /\.vue$/,
            loader: 'vue-loader'
        },
        {
            test: /\.(html)$/,
            loader: "file-loader?name=[name].[ext]"
        },
        {
            test: /\.css$/,
            loader: 'file-loader?name=css/[name].[ext]',
        },
        {
            test: /\.(jpg|svg)$/,
            loader: 'file-loader',
            options: {
                name: 'images/[name].[ext]',
                publicPath: '/'
            }
        },
        {
            test: /\.ttf$/,
            loader: 'file-loader?name=fonts/[name].[ext]',
            // options: {
            //     name: 'fonts/[name].[ext]',
            //     publicPath
            // }
        }]
    }
};