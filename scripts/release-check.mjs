import { releaseIssues } from '../lib/config.mjs';
const issues = releaseIssues();
if (issues.length) {
  console.error(`Release blocked: ${issues.length} owner / integration checks remain.\n` + issues.map(x=>'  • '+x).join('\n'));
  console.error('\nSee docs/LAUNCH_CHECKLIST.md. Do not mark untested approvals true.\nFor local design review only: npm run build:local');
  process.exitCode = 1;
} else console.log('Configuration and recorded-approval checks passed. This is not a substitute for the recorded live acceptance tests.');
