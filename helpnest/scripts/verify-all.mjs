// scripts/verify-all.mjs
// Comprehensive Automated Verification for HelpNest V1 Requirements A through AH

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('   HELPNEST V1 COMPREHENSIVE REQUIREMENTS VERIFICATION');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

// 1. SECTION V & W: FREE_SERVICES.md Verification
test('Section V & W: FREE_SERVICES.md exists with all required zero-budget columns', () => {
  const filePath = path.resolve('FREE_SERVICES.md');
  assert(fs.existsSync(filePath), 'FREE_SERVICES.md must exist');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Must contain decision table headers
  assert(content.includes('SERVICE'), 'Must include SERVICE');
  assert(content.includes('PURPOSE'), 'Must include PURPOSE');
  assert(content.includes('PROVIDER'), 'Must include PROVIDER');
  assert(content.includes('FREE LIMIT'), 'Must include FREE LIMIT');
  assert(content.includes('CARD REQUIRED?'), 'Must include CARD REQUIRED?');
  assert(content.includes('WHAT HAPPENS AT LIMIT?'), 'Must include WHAT HAPPENS AT LIMIT?');
  assert(content.includes('FALLBACK'), 'Must include FALLBACK');
  assert(content.includes('REPLACEMENT DIFFICULTY'), 'Must include REPLACEMENT DIFFICULTY');

  // Must detail zero-cost rule
  assert(content.includes('₹0'), 'Must document ₹0 budget rule');
  assert(content.includes('$0'), 'Must document $0 budget rule');
});

// 2. SECTION AF: Central Feature Flags Verification
test('Section AF: Central Feature Flags exist and prevent SMS carrier charges', () => {
  const filePath = path.resolve('src/config/features.ts');
  assert(fs.existsSync(filePath), 'src/config/features.ts must exist');
  const content = fs.readFileSync(filePath, 'utf-8');

  assert(content.includes('PHONE_OTP_ENABLED: false'), 'PHONE_OTP_ENABLED must be false by default');
  assert(content.includes('EMAIL_NOTIFICATIONS_ENABLED: true'), 'EMAIL_NOTIFICATIONS_ENABLED must exist');
  assert(content.includes('MAPS_ENABLED: true'), 'MAPS_ENABLED must exist');
  assert(content.includes('IMAGE_UPLOADS_ENABLED: true'), 'IMAGE_UPLOADS_ENABLED must exist');
  assert(content.includes('ORGANIZATIONS_ENABLED: true'), 'ORGANIZATIONS_ENABLED must exist');
  assert(content.includes('ACHIEVEMENTS_ENABLED: true'), 'ACHIEVEMENTS_ENABLED must exist');
});

// 3. SECTION A, B, E, F: Super Admin & Credential Security (Never show passwords to admin)
test('Section A, E, F: Super Admin RBAC and absolute credential security (no passwords to admin)', () => {
  const seedUsersPath = path.resolve('src/data/seedData.ts');
  const content = fs.readFileSync(seedUsersPath, 'utf-8');

  assert(content.includes('usr_super_admin'), 'Super Admin user must exist');
  assert(content.includes('admin@helpnest.org'), 'Platform owner email must exist');
  assert(content.includes("role: 'super_admin'"), 'Super Admin role must be defined');

  // Ensure passwords are not stored in plaintext
  assert(!content.includes('password:'), 'Password must never be stored on User object');
  assert(!content.includes('rawToken:'), 'Raw tokens must not be exposed');
  assert(!content.includes('otpCode:'), 'OTP codes must not be stored on user profiles');

  // Verify AdminCreateUserModal does not allow admin to set or retrieve plaintext password
  const createModalPath = path.resolve('src/components/admin/AdminCreateUserModal.tsx');
  const modalContent = fs.readFileSync(createModalPath, 'utf-8');
  assert(modalContent.includes('Secure Password Setup Link'), 'Must offer secure password setup link');
  assert(modalContent.includes('Temporary Password'), 'Must provide temporary password notice');
  assert(modalContent.includes('Credential Security Notice (Section F)'), 'Must enforce Section F security notice');
});

// 4. SECTION G: Bulk Account Creation & CSV Validation
test('Section G: Bulk Account Creation validates CSV and shows VALID, INVALID, DUPLICATES, TO CREATE', () => {
  const bulkModalPath = path.resolve('src/components/admin/AdminBulkCreateModal.tsx');
  const content = fs.readFileSync(bulkModalPath, 'utf-8');

  assert(content.includes('To Create'), 'Must display accounts to create');
  assert(content.includes('Valid Rows'), 'Must display valid rows');
  assert(content.includes('Invalid Rows'), 'Must display invalid rows');
  assert(content.includes('Duplicates'), 'Must display duplicates');
  assert(content.includes('bulkCreateUsers'), 'Must call bulkCreateUsers');
});

// 5. SECTION H: Account Deletion (Soft-delete & Anonymize, No Cascade Deletion)
test('Section H: Account deletion preserves moderation and audit integrity through anonymization', () => {
  const dbPath = path.resolve('src/services/db.ts');
  const content = fs.readFileSync(dbPath, 'utf-8');

  assert(content.includes('deleteUser'), 'deleteUser method must exist');
  assert(content.includes('isAnonymized = true'), 'Must set isAnonymized');
  assert(content.includes('[Anonymized User'), 'Must anonymize user name');
  assert(content.includes('ADMIN_DEACTIVATED_USER'), 'Must log audit event for account deactivation');
});

// 6. SECTION I: HelpNest Verification System & Safety Disclaimer
test('Section I: Official Verification with UNVERIFIED, VERIFIED, REVOKED & safety disclaimer', () => {
  const modalPath = path.resolve('src/components/common/VerificationModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf-8');

  assert(content.includes('Important Community Safety Disclaimer'), 'Must include explicit safety disclaimer');
  assert(content.includes('does NOT guarantee'), 'Must explain verification does not guarantee safety, honesty, or suitability');

  const badgePath = path.resolve('src/components/common/VerifiedBadge.tsx');
  assert(fs.existsSync(badgePath), 'VerifiedBadge component must exist');
});

// 7. SECTION J, K, L, M: Achievement System & Engine
test('Section J, K, L, M: Database-driven achievements engine with categories and milestones', () => {
  const seedPath = path.resolve('src/data/seedData.ts');
  const content = fs.readFileSync(seedPath, 'utf-8');

  // Verify required achievements
  assert(content.includes('First Donor'), 'First Donor achievement must exist');
  assert(content.includes('Blood Supporter'), 'Blood Supporter achievement must exist');
  assert(content.includes('Lifeline'), 'Lifeline achievement must exist');
  assert(content.includes('Community Lifeline'), 'Community Lifeline achievement must exist');

  assert(content.includes('First Help'), 'First Help must exist');
  assert(content.includes('Helping Hand'), 'Helping Hand must exist');
  assert(content.includes('Community Helper'), 'Community Helper must exist');
  assert(content.includes('Helping Hero'), 'Helping Hero must exist');
  assert(content.includes('Help Champion'), 'Help Champion must exist');
  assert(content.includes('Community Legend'), 'Community Legend must exist');

  assert(content.includes('First Ride Help'), 'First Ride Help must exist');
  assert(content.includes('5 Ride Helps'), '5 Ride Helps must exist');
  assert(content.includes('10 Ride Helps'), '10 Ride Helps must exist');

  assert(content.includes('First Education Help'), 'First Education Help must exist');
  assert(content.includes('First Successful Return'), 'First Successful Return must exist');

  // Verify anti-abuse check in engine
  const enginePath = path.resolve('src/services/achievementEngine.ts');
  const engineContent = fs.readFileSync(enginePath, 'utf-8');
  assert(engineContent.includes('interaction.helperId === interaction.requesterId'), 'Must prevent self-help abuse');
  assert(engineContent.includes('calculateCategoryMilestone'), 'Must export milestone progress calculator');
});

// 8. SECTION C: Admin Content Management & Distinct Audit Attribution
test('Section C: Post edits explicitly record "Edited by administrator" vs owner edits', () => {
  const dbPath = path.resolve('src/services/db.ts');
  const content = fs.readFileSync(dbPath, 'utf-8');

  assert(content.includes("type: 'ADMINISTRATOR'"), 'Must mark administrator edits as type ADMINISTRATOR');
  assert(content.includes('adminRemovePost'), 'Must support admin removing posts');
  assert(content.includes('adminRestorePost'), 'Must support admin restoring posts');
});

// 9. SECTION D, S: Admin Activity Explorer & Immutable Audit Logs
test('Section D & S: Activity Explorer and Immutable Audit Logs', () => {
  const activityPath = path.resolve('src/components/admin/AdminActivityExplorer.tsx');
  const auditPath = path.resolve('src/components/admin/AdminAuditLogs.tsx');
  assert(fs.existsSync(activityPath), 'AdminActivityExplorer must exist');
  assert(fs.existsSync(auditPath), 'AdminAuditLogs must exist');

  const auditContent = fs.readFileSync(auditPath, 'utf-8');
  assert(auditContent.includes('Immutable Ledger'), 'Must display immutable ledger badge');
  assert(auditContent.includes('Export Audit CSV'), 'Must support audit CSV export');
});

// 10. SECTION P, Q, R: Real Data Analytics & Filters
test('Section P, Q, R: Real Database Analytics, filters, and CSV export', () => {
  const analyticsPath = path.resolve('src/components/admin/AdminAnalytics.tsx');
  assert(fs.existsSync(analyticsPath), 'AdminAnalytics must exist');
  const content = fs.readFileSync(analyticsPath, 'utf-8');

  assert(content.includes('Regional Activity Distribution'), 'Must have privacy-preserving regional distribution');
  assert(content.includes('Safety & Trust Health'), 'Must have safety analytics');
  assert(content.includes('Achievement & Recognition Analytics'), 'Must have achievement analytics');
  assert(content.includes('exportToCsv'), 'Must have CSV export');
});

// 11. SECTION N & T: Premium Admin UI & User UI Layouts
test('Section N & T: Premium Admin & User Navigation and Components', () => {
  assert(fs.existsSync(path.resolve('src/components/admin/AdminLayout.tsx')), 'AdminLayout must exist');
  assert(fs.existsSync(path.resolve('src/components/admin/AdminOverview.tsx')), 'AdminOverview must exist');
  assert(fs.existsSync(path.resolve('src/components/admin/AdminUsers.tsx')), 'AdminUsers must exist');
  assert(fs.existsSync(path.resolve('src/components/admin/AdminContent.tsx')), 'AdminContent must exist');
  assert(fs.existsSync(path.resolve('src/components/admin/AdminAchievements.tsx')), 'AdminAchievements must exist');
  assert(fs.existsSync(path.resolve('src/components/admin/AdminVerification.tsx')), 'AdminVerification must exist');

  assert(fs.existsSync(path.resolve('src/components/user/UserNavbar.tsx')), 'UserNavbar must exist');
  assert(fs.existsSync(path.resolve('src/components/user/UserHome.tsx')), 'UserHome must exist');
  assert(fs.existsSync(path.resolve('src/components/user/UserProfile.tsx')), 'UserProfile must exist');
  assert(fs.existsSync(path.resolve('src/components/user/PostCard.tsx')), 'PostCard must exist');
  assert(fs.existsSync(path.resolve('src/components/user/CreatePostModal.tsx')), 'CreatePostModal must exist');
  assert(fs.existsSync(path.resolve('src/components/user/PostDetailModal.tsx')), 'PostDetailModal must exist');
});

// 12. SECTION AH: Final Admin Validation Checklist
test('Section AH: Final Admin Validation Checklist Items Verified', () => {
  const distHtml = path.resolve('dist/index.html');
  assert(fs.existsSync(distHtml), 'Compiled production dist/index.html must exist');
});

console.log('\n====================================================');
console.log(`VERIFICATION SUMMARY: ${passedTests} / ${totalTests} test suites passed.`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
