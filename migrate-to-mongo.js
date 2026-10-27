/**
 * CLI Migration Tool: SQLite to MongoDB
 * Run: node migrate-to-mongo.js
 */

require('dotenv').config();
const sqliteDb = require('./db');
const { connectMongoDB, migrateFromSqlite } = require('./mongodb');

async function run() {
    console.log('==================================================');
    console.log('🚀 SevaSetu Database Migration: SQLite -> MongoDB');
    console.log('==================================================');

    const conn = await connectMongoDB();
    if (!conn) {
        console.error('❌ Migration aborted: Could not connect to MongoDB.');
        console.error('Please ensure MONGODB_URI is set in .env or local MongoDB is running.');
        process.exit(1);
    }

    try {
        const result = await migrateFromSqlite(sqliteDb);
        console.log('\n🎉 Migration completed successfully!');
        console.log(`👤 Users migrated: ${result.users}`);
        console.log(`🏠 Organizations migrated: ${result.organizations}`);
        console.log(`💳 Donations migrated: ${result.donations}`);
        console.log('==================================================\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

run();
