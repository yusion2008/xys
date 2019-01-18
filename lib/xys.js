const fs = require('fs-extra')
const chalk = require('chalk')
const BASEPATH = __dirname.toString().replace("lib", "");
exports.run = function(type, name) {
    switch (type) {
        case 'page':
            const pageFile = './src/page/' + name + '/' + name + '.vue'
            const styleFile = './src/page/' + name + '/' + name + '.less'
            fs.pathExists(pageFile, (err, exists) => {
                if (exists) {
                    console.log('this file has created')
                } else {
                    fs.copy(BASEPATH+'template/page.vue', pageFile, err => {
                        if (err) return console.error(err)
                
                        console.log(pageFile + '  has created')
                    })
                    fs.copy(BASEPATH+'template/page.less', styleFile, err => {
                        if (err) return console.error(err)
                
                        console.log(styleFile + '  has created')
                    })
                }
            })
            break;
        
        default:
            console.log(chalk.red(`ERROR: uncaught type , you should input like $ xys p page pageName` ))
            console.log()
            console.log('  Examples:')
            console.log()
            console.log(chalk.gray('    # create a new page'))
            console.log('    $ xys p page product')
            console.log()
            console.log(chalk.gray('    # create a new component'))
            console.log('    $ xys p component  product')
            console.log()
            console.log(chalk.gray('    # create a new store'))
            console.log('    $ xys p store  product')
            console.log()
            break;
    }
};
