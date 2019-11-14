const path = require("path");
const glob = require('glob');

function getEntries(patterns) {
    const entries = {};
    patterns.forEach((pattern) => {
        glob.sync(pattern).forEach((file) => {
            entries[file.replace('src/', '')] = path.join(__dirname, file);
        });
    });
    console.log(entries);
    return entries;
}

module.exports = [
    {
        mode: 'development',
        entry: './src/js/client.js',
        name: 'js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'js/client.js',
        },
        module: {
            rules: [
                {
                    test: /\.js?/,
                    exclude: [
                        '/test',
                        '/node_modules/'
                    ],
                    use: ["babel-loader"]
                }
            ]
        },
        resolve: {
            extensions: ['.js']
        }
    },
    {
        mode: 'production',
        entry: './src/scss/client.scss',
        name: 'scss',
        module: {
            rules: [
                {
                    test: /\.scss?/,
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
                }
            ]
        },
        resolve: {
            extensions: ['.scss']
        }
    }
]