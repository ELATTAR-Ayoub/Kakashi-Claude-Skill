/**
 * Report verification results in a consistent format.
 *
 * @param {string} scriptName - e.g. "verify-content"
 * @param {Array<{check: string, pass: boolean, details?: string}>} results
 * @returns {void} - prints to stdout, exits with code 0 (all pass) or 1 (any fail)
 */
function report(scriptName, results) {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const total = results.length;

  console.log(`\n=== ${scriptName} ===`);
  console.log(`Result: ${failed === 0 ? "PASS" : "FAIL"} (${passed}/${total} checks passed)\n`);

  for (const r of results) {
    const icon = r.pass ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${r.check}`);
    if (!r.pass && r.details) {
      // Indent detail lines
      const lines = r.details.split("\n");
      for (const line of lines.slice(0, 20)) {
        console.log(`         ${line}`);
      }
      if (lines.length > 20) {
        console.log(`         ... and ${lines.length - 20} more`);
      }
    }
  }

  console.log("");
  process.exitCode = failed > 0 ? 1 : 0;
}

module.exports = { report };
