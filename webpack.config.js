const path = require("path")

module.exports = {
  entry: {
    index: "./src/index.js",
    url: "./src/url_utils",
  },
  output: {
    filename: "[name].js",
    path: __dirname,
    library: "course-search-utils",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}
