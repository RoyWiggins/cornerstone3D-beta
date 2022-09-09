#! /usr/bin/env node

/* eslint-disable */
var { program } = require('commander');
var path = require('path');
var shell = require('shelljs');
var fs = require('fs');

var webpackConfigPath = path.join(
  __dirname,
  './webpack-AUTOGENERATED.config.js'
);
var distDir = path.join(__dirname, 'dist');
var buildConfig = require('./template-config.js');
const rootPath = path.resolve(path.join(__dirname, '../..'));

program
  .option('-c, --config [file.js]', 'Configuration file')
  .option('--no-browser', 'Do not open the browser')
  .parse(process.argv);

function validPath(str) {
  return str.replace(/\\\\/g, "/");
}


exBasePath =  '/home/vagrant/cornerstone3D-beta/packages/tools/examples'
exampleName =  'bundle'
relPath = './bundle.ts'


const conf = buildConfig(
  exampleName,
  relPath,
  distDir,
  validPath(rootPath),
  validPath(exBasePath)
);
// console.log('buildConfig result', conf);
shell.ShellString(conf).to(webpackConfigPath);
shell.cd(exBasePath);
shell.exec(`webpack --progress --config ${webpackConfigPath}`);

// shell.exec(`webpack serve --progress --config ${webpackConfigPath}`);
// } else {
//   console.log('=> To run an example:');
//   console.log('  $ npm run example -- PUT_YOUR_EXAMPLE_NAME_HERE\n');
// }
// }
