#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk')
const xys = require('../lib/xys');


/**
 * Usage.
 */

program
.command('project')
.description('quick create your file')
.alias('p')
.action(function(type, name){
    xys.run(type, name);
});
program.parse(process.argv);
