/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
export function titleToCaseIds(title: string): number[] {
  let caseIds: number[] = [];

  let testCaseIdRegExp: RegExp = /\bT?C(\d+)\b/g;
  let m;
  while ((m = testCaseIdRegExp.exec(title)) !== null) {
    let caseId = parseInt(m[1]);
    caseIds.push(caseId);
  }
  return caseIds;
}
