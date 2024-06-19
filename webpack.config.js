const path = require('path');

module.exports = {
  entry: './frontend/index.js',  // input file
  output: {
    filename: 'index-bundle.js',
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
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
          },
        }
      },
      // Webpack asset loader for images, etc.
      {
        test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
  }
};




