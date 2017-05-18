const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HappyPack = require("happypack");
const happyThreadPool = HappyPack.ThreadPool({ size: 4 });

const PRODUCTION = process.env.NODE_ENV === "production";

console.log("PRODUCTION: " + JSON.stringify(PRODUCTION));

const entry = PRODUCTION ? {
    rhythm: ["./web/js/rhythm.es6"],
    app: ["./web/js/app.es6"]
} : {
    app: [
        "./web/js/app.es6",
        "webpack/hot/dev-server",
        "webpack-dev-server/client?http://localhost:8080"
    ]
};

const plugins = PRODUCTION ? [
    new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        sourceMap: false,
        output: {
            comments: false
        }
    }),
    new ExtractTextPlugin("style.css"),
    new CopyWebpackPlugin([{
        from: {
            glob: path.resolve(__dirname, "web", "images", "\.(png|jpg|jpeg|gif|svg)$"),
            dot: true
        },
        to: path.resolve(__dirname, "build")
    }]),
    new CopyWebpackPlugin([{
        from: {
            glob: path.resolve(__dirname, "web", "fonts", "\.(eot|ttf|woff|woff2)$"),
            dot: true
        },
        to: path.resolve(__dirname, "build")
    }])
] : [
    new webpack.HotModuleReplacementPlugin()
];


const cssIdentifier = PRODUCTION ? "[name]" : "[hash:base64:10]";

plugins.push(
    new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(PRODUCTION)
    }),
    // new HTMLWebpackPlugin({
    //     chunks: ["app"],
    //     filename: "index.html",
    //     template: "./web/index.html",
    //     minify: {
    //         collapseWhitespace: true,
    //         removeComments: true,
    //         removeRedundantAttributes: true,
    //         removeScriptTypeAttributes: true,
    //         removeStyleLinkTypeAttributes: true
    //     }
    // }),
    new HTMLWebpackPlugin({
        chunks: ["app"],
        filename: "hamster-ru.html",
        template: "./web/hamster-ru.html",
        minify: {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        }
    }),
    // new HTMLWebpackPlugin({
    //     chunks: ["app"],
    //     filename: "hamster-en.html",
    //     template: "./web/hamster-en.html",
    //     minify: {
    //         collapseWhitespace: true,
    //         removeComments: true,
    //         removeRedundantAttributes: true,
    //         removeScriptTypeAttributes: true,
    //         removeStyleLinkTypeAttributes: true
    //     }
    // }),
    new HappyPack({
        id: "babel",
        threadPool: happyThreadPool,
        loaders: ["babel-loader?" + JSON.stringify({presets: [["es2015", {modules: false, loose: true}], "stage-0"], cacheDirectory: true})]
    }),
    new HappyPack({
        id: "html",
        threadPool: happyThreadPool,
        loaders: ["html-loader?minimize=true"]
    }),
    new HappyPack({
        id: "css",
        threadPool: happyThreadPool,
        loaders: ["css-loader?localIdentName=" + cssIdentifier+"!csso-loader?-restructure"]
    })
);

const cssLoader = PRODUCTION ? ExtractTextPlugin.extract("happypack/loader?id=css") : ["style-loader", "css-loader?localIdentName=" + cssIdentifier];

const devTool = PRODUCTION ? "false" : "source-map";

const config = {
    devtool: devTool,
    entry: entry,
    plugins: plugins,
    module: {
        rules: [{
            test: /\.(js|es6)$/,
            exclude: [/node_modules/],
            use: "happypack/loader?id=babel"
        },
        {
            test: /\.css$/,
            exclude: [/node_modules/],
            use: cssLoader
        }, {
            test: /\.html$/,
            exclude: [/node_modules/],
            use: "happypack/loader?id=html"
        }, {
            test: /\.(png|jpg|jpeg|gif|svg)$/,
            exclude: [/node_modules/],
            use: "url-loader?limit=5000&name=images/[name].[ext]"
        }, {
            test: /\.(eot|ttf|woff|woff2)$/,
            exclude: [/node_modules/],
            use: "url-loader?limit=5000&name=fonts/[name].[ext]"
        }
        ]
    },

    output: {
        path: path.join(__dirname, "build", "web"),
        publicPath: "",
        filename: PRODUCTION ? "[name].min.js" : "[hash:12].[name].js",
    },

    performance: {
        maxEntrypointSize: 2000000,
        maxAssetSize: 1000000
    }

};

module.exports = config;