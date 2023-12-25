const webpack = require('webpack');
const path = require('path');
const env = require('./utils/env');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const fileExtensions = ['jpg', 'png', 'js', 'css', 'ts'];
const devFolder = 'dev';

const options = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    popup: path.join(__dirname, 'src', 'popup', 'index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, devFolder),
    clean: true,
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: fileExtensions.map((extension) => '.' + extension),
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, devFolder),
          force: true,
          transform: function (content) {
            return Buffer.from(
              JSON.stringify({
                ...JSON.parse(content.toString()),
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
              })
            );
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
  ],
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'source-map';
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}

module.exports = options;
