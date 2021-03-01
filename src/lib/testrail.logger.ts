const chalk = require('chalk');

const TestRailLogger = {
    log: (text) => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log('\n', ' - ' + text, '\n');
    },
    warn: (text) => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.warn('\n', ' - ' + text, '\n');
    }
}

module.exports = TestRailLogger;