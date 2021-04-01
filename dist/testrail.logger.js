var chalk = require('chalk');
var TestRailLogger = {
    log: function (text) {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log('\n', ' - ' + text, '\n');
    },
    warn: function (text) {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.warn('\n', ' - ' + text, '\n');
    }
};
module.exports = TestRailLogger;
//# sourceMappingURL=testrail.logger.js.map