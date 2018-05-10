"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
function titleToCaseIds(title) {
    var caseIds = [];
    var testCaseIdRegExp = /\bT?C(\d+)\b/g;
    var m;
    while ((m = testCaseIdRegExp.exec(title)) !== null) {
        var caseId = parseInt(m[1]);
        caseIds.push(caseId);
    }
    return caseIds;
}
exports.titleToCaseIds = titleToCaseIds;
//# sourceMappingURL=shared.js.map