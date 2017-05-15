const devServer = require("webpack-dev-server");
const webpack = require("webpack");
const config = require("./webpack.config.js");

const compiler = webpack(config);
const server = new devServer(compiler, {
    "hot": false,
    "filename": config.output.filename,
    "publicPath": config.output.publicPath,
    "disableHostCheck": true,
    "stats": {
        "colors": true
    }
});

server.listen(8080, "0.0.0.0", function () {
});
