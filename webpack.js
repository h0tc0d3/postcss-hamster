const devServer = require("webpack-dev-server");
const webpack = require("webpack");
const config = require("./webpack.config.js");

const compiler = webpack(config);
const server = new devServer(compiler, {
    "hot": true,
    "filename": config.output.filename,
    "publicPath": config.output.publicPath,
    "stats": {
        "colors": true
    }
});

server.listen(8080, "0.0.0.0", function () {
});
