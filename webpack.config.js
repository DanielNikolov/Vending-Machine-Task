const path = require("path");

module.exports = {
    entry: ["./src/js/client.js", "./src/scss/client.scss"],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "js/client.js"
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'css/[name].css',
                        }
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'css-loader?-url'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.js?/,
                exclude: [
                    "/test/",
                    "/node_modules/"
                ],
                use: ["babel-loader"]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".scss"]
    }
}