var path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        libraryTarget: "var",
        library: "Asteroid",
        path: path.join(__dirname, "/dist"),
        filename: "Asteroid.js"
    },
    externals: {
        "wolfy87-eventemitter": "EventEmitter",
        "ddp.js": "DDP",
        "promiz": "Promise"
    }
};
