/**
 * 🔒 Script untuk migrate semua plain text passwords ke bcrypt hash
 * Run this once: node src/scripts/migratePasswords.js
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../database/users.json');
const SALT_ROUNDS = 12;

async function migratePasswords() {
    try {
        console.log('🔒 Starting password migration...\n');

        // Read users file
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(data);

        console.log(`Found ${users.length} users\n`);

        let migratedCount = 0;
        let skippedCount = 0;

        // Process each user
        for (const user of users) {
            // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
                console.log(`⏭️  Skipping ${user.username} - password already hashed`);
                skippedCount++;
                continue;
            }

            // Hash the plain text password
            console.log(`🔐 Migrating password for: ${user.username}`);
            const plainPassword = user.password;
            const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

            user.password = hashedPassword;
            migratedCount++;

            console.log(`   Plain: ${plainPassword.substring(0, 10)}...`);
            console.log(`   Hash:  ${hashedPassword.substring(0, 30)}...\n`);
        }

        // Write back to file
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

        console.log('\n✅ Migration completed!');
        console.log(`   Migrated: ${migratedCount} users`);
        console.log(`   Skipped:  ${skippedCount} users (already hashed)`);
        console.log(`   Total:    ${users.length} users\n`);

        // Create backup warning
        console.log('⚠️  IMPORTANT: Original passwords have been replaced!');
        console.log('   If you need to rollback, restore from your backup.\n');

    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}

// Run migration
migratePasswords();
