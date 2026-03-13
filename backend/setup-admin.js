#!/usr/bin/env node
/**
 * ARC-NETWORK Admin Setup Script
 * Usage:
 *   node setup-admin.js create  --username=myname --email=me@mail.com --password=secret123
 *   node setup-admin.js list
 *   node setup-admin.js promote --id=u-xxxxxxxx
 *   node setup-admin.js reset   --username=admin --password=newpass123
 */
'use strict';

const DB   = require('./db/database');
const args = process.argv.slice(2);
const cmd  = args[0];

// Parse --key=value flags
function getFlag(name) {
  const flag = args.find(a => a.startsWith(`--${name}=`));
  return flag ? flag.split('=').slice(1).join('=') : null;
}

DB.init();

switch (cmd) {
  case 'create': {
    const username = getFlag('username');
    const email    = getFlag('email');
    const password = getFlag('password');
    if (!username || !email || !password) {
      console.error('Usage: node setup-admin.js create --username=NAME --email=EMAIL --password=PASS');
      process.exit(1);
    }
    try {
      const user = DB.createAdmin({ username, email, password });
      console.log('✓ Admin created successfully:');
      console.log(`  ID:       ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Role:     ${user.role}`);
    } catch (e) {
      console.error('✗ Error:', e.message);
      process.exit(1);
    }
    break;
  }

  case 'list': {
    const users = DB.getAllUsers();
    console.log('\nARC-NETWORK Users:\n');
    console.log('ID'.padEnd(22) + 'USERNAME'.padEnd(22) + 'ROLE'.padEnd(10) + 'EMAIL');
    console.log('─'.repeat(80));
    users.forEach(u => {
      console.log(u.id.padEnd(22) + u.username.padEnd(22) + u.role.padEnd(10) + u.email);
    });
    console.log(`\nTotal: ${users.length} users`);
    break;
  }

  case 'promote': {
    const id = getFlag('id');
    if (!id) { console.error('Usage: node setup-admin.js promote --id=USER_ID'); process.exit(1); }
    if (DB.promoteToAdmin(id)) {
      console.log(`✓ User ${id} promoted to admin`);
    } else {
      console.error(`✗ User not found: ${id}`);
      process.exit(1);
    }
    break;
  }

  case 'reset': {
    const username = getFlag('username');
    const password = getFlag('password');
    if (!username || !password) {
      console.error('Usage: node setup-admin.js reset --username=NAME --password=NEWPASS');
      process.exit(1);
    }
    const user = DB.findUserByUsernameOrEmail(username);
    if (!user) { console.error(`✗ User not found: ${username}`); process.exit(1); }
    user.passwordHash = DB.hashPassword(password);
    DB.save();
    console.log(`✓ Password reset for ${username}`);
    break;
  }

  default:
    console.log(`
ARC-NETWORK Admin CLI
─────────────────────
Commands:
  node setup-admin.js create  --username=NAME --email=EMAIL --password=PASS
  node setup-admin.js list
  node setup-admin.js promote --id=USER_ID
  node setup-admin.js reset   --username=NAME --password=NEWPASS

Examples:
  node setup-admin.js create --username=arunachalam --email=you@mail.com --password=SecurePass123
  node setup-admin.js list
  node setup-admin.js promote --id=u-a1b2c3d4e5f6
  node setup-admin.js reset --username=admin --password=NewPass456
`);
}
