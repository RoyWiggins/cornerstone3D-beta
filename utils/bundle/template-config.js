const path = require('path');

const csRenderBasePath = path.resolve('../core/src/index');
const csToolsBasePath = path.resolve('../tools/src/index');
const csStreamingBasePath = path.resolve(
  '../streaming-image-volume-loader/src/index'
);

module.exports = function buildConfig(
  name,
  relPath,
  destPath,
  root,
  exampleBasePath
) {
  console.log('root=', root);
  return `
// THIS FILE IS AUTOGENERATED - DO NOT EDIT
var path = require('path')

var rules = require('./rules.js');
var modules = [path.resolve('../node_modules/'), path.resolve('../../../node_modules/')];

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var webpack = require('webpack');
var path = require('path');
module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    new ESLintPlugin(),
    new HtmlWebpackPlugin({
      template: '${root.replace(
        /\\/g,
        '/'
      )}/utils/bundle/template.html',
    }),
    new webpack.DefinePlugin({
      __BASE_PATH__: "''",
    }),
    new CopyPlugin({
      patterns: [
        {
          from:
            '../../../node_modules/cornerstone-wado-image-loader/dist/dynamic-import',
          to: '${destPath.replace(/\\/g, '/')}',
        },
      ],
    }),
    // new BundleAnalyzerPlugin()
  ],
  entry: path.join('${exampleBasePath.replace(
    /\\/g,
    '/'
  )}', '${relPath.replace(/\\/g, '/')}'),
  output: {
    path: '${destPath.replace(/\\/g, '/')}',
    filename: '${name}.js',
  },
  module: {
    rules,
  },
  resolve: {
    alias: {
      '@cornerstonejs/core': '${csRenderBasePath.replace(/\\/g, '/')}',
      '@cornerstonejs/tools': '${csToolsBasePath.replace(/\\/g, '/')}',
      '@cornerstonejs/streaming-image-volume-loader': '${csStreamingBasePath.replace(
        /\\/g,
        '//'
      )}',
      // We use this alias and the CopyPlugin to support using the dynamic-import version
      // of WADO Image Loader
      'cornerstone-wado-image-loader': 'cornerstone-wado-image-loader/dist/dynamic-import/cornerstoneWADOImageLoader.min.js',
    },
    modules,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      events: false
    },
  },
  devServer: {
    hot: true,
    open: false,
    port: 3000,
    historyApiFallback: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  },
  /*optimization: {
    minimize: false,
    usedExports: true,
    sideEffects: true
  }*/
};
`;
};