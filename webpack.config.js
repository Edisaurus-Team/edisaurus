const path = require('path');

module.exports = {
  entry: './frontend/index.js',  // path to our input file
  output: {
    filename: 'index-bundle.js',  // output bundle file name
    path: path.resolve(__dirname, './static'),  // path to our Django static directory
  },

  // use Babel's env and react presets to compile all .js and .jsx files that aren't inside the node_modules directory
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use:{
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env", "@babel/preset-react"] }
        }
      },
    ]
  }
};




