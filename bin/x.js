#!/usr/bin/env node

process.title = 'xys';

// 引入依赖

var program = require('commander');
var vfs = require('vinyl-fs');
var through = require('through2');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const v=`
--------------------------------------------------
--${chalk.green('\\\\\\')}--------${chalk.green('///')}---${chalk.green('\\\\\\')}--------${chalk.green('///')}-----${chalk.green('////\\\\\\\\')}----
---${chalk.green('\\\\\\')}------${chalk.green('///')}-----${chalk.green('\\\\\\')}------${chalk.green('///')}----${chalk.green('///')}------${chalk.green('\\\\\\')}--
----${chalk.green('\\\\\\')}----${chalk.green('///')}-------${chalk.green('\\\\\\')}----${chalk.green('///')}----${chalk.green('|||')}------------
-----${chalk.green('\\\\\\')}--${chalk.green('///')}---------${chalk.green('\\\\\\')}--${chalk.green('///')}------${chalk.green('\\\\\\')}-----------
------${chalk.green('\\\\\\')}${chalk.green('///')}-----------${chalk.green('\\\\\\')}${chalk.green('///')}---------${chalk.green('\\\\\\||\\\\\\')}----
------${chalk.green('///')}${chalk.green('\\\\\\')}------------${chalk.green('||||')}-----------------${chalk.green('\\\\\\')}--
-----${chalk.green('///')}--${chalk.green('\\\\\\')}-----------${chalk.green('||||')}------------------${chalk.green('|||')}-
----${chalk.green('///')}----${chalk.green('\\\\\\')}----------${chalk.green('||||')}------${chalk.green('\\\\\\')}---------${chalk.green('///')}-
---${chalk.green('///')}------${chalk.green('\\\\\\')}---------${chalk.green('||||')}-------${chalk.green('\\\\\\')}-------${chalk.green('///')}--
--${chalk.green('///')}--------${chalk.green('\\\\\\')}--------${chalk.green('||||')}---------${chalk.green('\\\\\\\\\\/////')}---
--------------------------------------------------
`;

const ver=chalk.green('v')+chalk.red(require('../package').version);


// 定义版本和参数选项
program
    .version(v + '\n' + ver,'-v, --version')
    .option('-i --init [name]', 'init a xsp Env')
    .option('-p, --project [name]', 'create a xsp project')
    .option('-c, --create [name]', 'create a xsp page');

// 必须在.parse()之前，因为node的emit()是即时的
program.on('--help', function() {
    console.log('Examples:');
    console.log('');
    console.log('    xys -i programName');
    console.log('');
    console.log('    xys -p projectName');
    console.log('');
    console.log('    xys -c pageName');
    console.log('');
});


program.parse(process.argv);

if (program.init) {
    // 获取将要构建的项目根目录
    var projectPath = path.resolve(program.init);
    // 获取将要构建的项目名称
    var projectName = path.basename(projectPath);

    console.log(`Start to init a xsp Env in ${chalk.green(projectPath)}`);

    // 根据将要构建的项目名称创建文件夹
    fs.ensureDirSync(projectName);

    // 获取本地模块下的template目录
    var cwd = path.join(__dirname, '../template/');

    // 从template目录中读取除node_modules目录下的所有文件并筛选处理
    vfs.src(['**/*', '!node_modules/**/*'], { cwd: cwd, dot: true })
        .pipe(through.obj(function(file, enc, callback) {
            if (!file.stat.isFile()) {
                return callback();
            }

            this.push(file);
            return callback();
        }))
        // 将从template目录下读取的文件流写入到之前创建的文件夹中
        .pipe(vfs.dest(projectPath))
        .on('end', function() {
            console.log('Installing packages...')

            // 将node工作目录更改成构建的项目根目录下
            process.chdir(projectPath);

            // 执行安装命令
            require('../lib/install');
        })
        .resume();
}

if (program.project) {
    // 获取将要构建的项目根目录
        var projectPath = path.resolve(program.project);
        // 获取将要构建的项目名称
        var projectName = path.basename(projectPath);

        console.log(`Start to init a xsp project in ${chalk.green(projectPath)}`);

        // 根据将要构建的项目名称创建文件夹
        fs.ensureDirSync(projectName);

        // 获取本地模块下的template目录
        var cwd = path.join(__dirname, '../program/');

        // 从program目录中读取除node_modules目录下的所有文件并筛选处理
        vfs.src(['**/*', '!node_modules/**/*'], { cwd: cwd, dot: true })
            .pipe(through.obj(function(file, enc, callback) {
                if (!file.stat.isFile()) {
                    return callback();
                }

                this.push(file);
                return callback();
            }))
            // 将从program目录下读取的文件流写入到之前创建的文件夹中
            .pipe(vfs.dest(projectPath))
            .on('end', function() {
                console.log('project has created !')
            })
            .resume();
}

if (program.create) {
	const BASEPATH = __dirname.toString().replace("bin", "");
    // 获取将要构建的项目根目录
    var projectPath = path.resolve(program.create);
    // 获取将要构建的页面名称
    var name = path.basename(projectPath);


    const pageFile = './' + name + '/' + name + '.js'

    fs.pathExists(pageFile, (err, exists) => {
        if (exists) {
            console.log('this file has created')
        } else {
            fs.copy(BASEPATH+'program/index.js', pageFile, err => {
                if (err) return console.error(err)        
                console.log(pageFile + '  has created')
            })            
        }
    })
}