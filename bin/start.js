#!/usr/bin/env node

'use strict';

var ArgumentParser = require('argparse').ArgumentParser;
var nodemon = require('nodemon');
var path = require('path');
var fs = require('fs');
var parser = new ArgumentParser();
var colors = require('colors');

parser.addArgument(
  [ '-p', '--path' ],
  {
    help: 'Path to Alexa skill'
  }
);

parser.addArgument(
  [ '--interaction-model' ],
  {
    help: 'Path to interaction model'
  }
);

// Add the port option
parser.addArgument(
  ['--port'],
  {
    help: 'Run on a specific port (default = 3000)'
  }
);

var args = parser.parseArgs();

var currentPath = args.path ? args.path : '.';
currentPath = path.resolve(currentPath);

// Set port value
var port = args.port ? args.port : 3000;

try {
  var skillPackageConf = require(currentPath + '/package.json');
} catch (err) {
  console.error('Package.json not found.'.red);
  process.exit(1);
}

if (typeof skillPackageConf.name !== 'string') {
  console.error('Package.json requires a name property.'.red);
  process.exit(1);
}

if (!skillPackageConf.main) {
  console.error('Main script file not found.'.red);
  process.exit(1);
}

var mainScriptFile = skillPackageConf.main;

try {
  var mainScript = require(currentPath + '/' + mainScriptFile);
} catch (error) {
  console.error('Problem with main script file.'.red);
  console.log(error);
  process.exit(1);
}

var serverArgs = [
  currentPath  + '/' + mainScriptFile,
  skillPackageConf.name, '--port ' + port
];

var watchList = [
  __dirname + '/../server.js',
  __dirname + '/../package.json',
  __dirname + '/../webpack.config.js',
  currentPath + '/'
];

if (args.interaction_model) {
  watchList.push(path.resolve(args.interaction_model));
  serverArgs.push('--interaction-model ' + path.resolve(args.interaction_model));
}

nodemon({
  nodeArgs: (process.env.REMOTE_DEBUG) ? ['--debug'] : [],
  script: __dirname + '/../server.js',
  args: serverArgs,
  watch: watchList,
  env: {
    'DEBUG': (process.env.DEBUG) ? process.env.DEBUG : 'skill'
  }
});
