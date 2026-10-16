const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'sevasetu.db');

let db;
try {
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
} catch (e) {
    console.warn('Re-initializing fresh SQLite database...');
    try {
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    } catch (_) {}
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
}

// Initialize Tables
function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mobile TEXT,
            city TEXT,
            password TEXT NOT NULL,
            manager TEXT,
            address TEXT,
            extra_info TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS donations (
            id TEXT PRIMARY KEY,
            order_id TEXT,
            payment_id TEXT,
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'INR',
            donor_name TEXT,
            donor_email TEXT,
            org_name TEXT NOT NULL,
            cause_type TEXT,
            method TEXT DEFAULT 'Razorpay',
            status TEXT DEFAULT 'Success',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS organizations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL,
            city TEXT,
            needs TEXT,
            verified INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS urgent_needs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            org_name TEXT NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            target_amount INTEGER NOT NULL,
            raised_amount INTEGER DEFAULT 0,
            urgency TEXT DEFAULT 'High',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_name TEXT NOT NULL,
            sender_role TEXT NOT NULL,
            receiver_name TEXT,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            otp TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            verified INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Safe migration: Add status column if existing DB didn't have it
    try {
        db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'approved';");
    } catch (_) {}

    // Seed Demo Users if empty
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        const hash1 = bcrypt.hashSync('123456', 10);
        const hash2 = bcrypt.hashSync('12345', 10);
        const hash3 = bcrypt.hashSync('701190', 10);

        const insertUser = db.prepare(`
            INSERT INTO users (role, name, email, mobile, city, password, manager, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertUser.run('donor', 'Gaurav Yadav', 'ggy318928@gmail.com', '9876543210', 'Delhi', hash1, null, 'approved');
        insertUser.run('oldage', 'Happy Old Age Home', 'sevasetu@gmail.com', '9170119069', 'Delhi', hash2, 'Director', 'approved');
        insertUser.run('orphanage', 'Sunrise Orphanage', 'yazangupta233@gmail.com', '9170119069', 'Mumbai', hash3, 'Yazan Gupta', 'approved');

        console.log('✅ Default users seeded into SQLite database.');
    }

    // Seed Default Admin if not exists
    try {
        const adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin' OR email = 'admin@sevasetu.org'").get();
        if (!adminUser) {
            const adminHash = bcrypt.hashSync('admin123', 10);
            db.prepare(`
                INSERT INTO users (role, name, email, mobile, city, password, manager, status)
                VALUES ('admin', 'SevaSetu Admin', 'admin@sevasetu.org', '9999999999', 'National HQ', ?, 'Administrator', 'approved')
            `).run(adminHash);
            console.log('✅ Admin account initialized: admin@sevasetu.org / admin123');
        }
    } catch (e) {
        console.error('Admin seed error:', e.message);
    }

    // Seed Initial Donations if empty
    const donationCount = db.prepare('SELECT COUNT(*) as count FROM donations').get().count;
    if (donationCount === 0) {
        const insertDonation = db.prepare(`
            INSERT INTO donations (id, order_id, payment_id, amount, currency, donor_name, donor_email, org_name, cause_type, method, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertDonation.run('DON-847291', 'order_demo_1', 'pay_demo_847291', 2000, 'INR', 'Gaurav Yadav', 'ggy318928@gmail.com', 'Sunrise Orphanage', 'Food & Books', 'Razorpay', 'Success', '2026-03-12 14:30:00');
        insertDonation.run('DON-847290', 'order_demo_2', 'pay_demo_847290', 1500, 'INR', 'Gaurav Yadav', 'ggy318928@gmail.com', 'Happy Old Age Home', 'Food & Groceries', 'UPI QR', 'Success', '2026-03-10 11:15:00');
        insertDonation.run('DON-847289', 'order_demo_3', 'pay_demo_847289', 8500, 'INR', 'Gaurav Yadav', 'ggy318928@gmail.com', 'Care & Love Old Age Home', 'Medical Care & Medicines', 'Razorpay', 'Success', '2026-03-08 16:45:00');
        insertDonation.run('DON-847288', 'order_demo_4', 'pay_demo_847288', 3500, 'INR', 'Gaurav Yadav', 'ggy318928@gmail.com', 'Bal Asha Trust', 'Toys & Study Material', 'Razorpay', 'Success', '2026-03-05 09:20:00');

        console.log('✅ Baseline donations seeded into SQLite database.');
    }

    // Seed Organizations if empty
    const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get().count;
    if (orgCount === 0) {
        const insertOrg = db.prepare('INSERT INTO organizations (name, type, city, needs) VALUES (?, ?, ?, ?)');
        const orgs = [
            ['Gandhi Orphanage', 'orphanage', 'Delhi', 'Food, Clothes, Books'],
            ['Bal Asha Trust', 'orphanage', 'Mumbai', 'Toys, Study Material, Fruits'],
            ['Hope Children Home', 'orphanage', 'Jaipur', 'Clothes, Blankets, Food'],
            ['Shishu Bhavan', 'orphanage', 'Kolkata', 'Baby Care, Hygiene Kits, Fruits'],
            ['Little Angels Home', 'orphanage', 'Pune', 'Books, Bags, Shoes'],
            ['Anand Old Age Home', 'oldage', 'Delhi', 'Fruits, Medicines, Clothes'],
            ['Seva Dham', 'oldage', 'Varanasi', 'Bedsheets, Essentials, Food'],
            ['Jeevan Jyoti Home', 'oldage', 'Lucknow', 'Medicines, Fruits, Hygiene'],
            ['Shanti Niketan', 'oldage', 'Haridwar', 'Clothes, Blankets, Food'],
            ['Care & Love Old Age Home', 'oldage', 'Bangalore', 'Essentials, Fruits, Medicines']
        ];
        for (const [name, type, city, needs] of orgs) {
            insertOrg.run(name, type, city, needs);
        }
        console.log('✅ Organizations list seeded into SQLite database.');
    }

    // Seed Urgent Needs if empty
    const needsCount = db.prepare('SELECT COUNT(*) as count FROM urgent_needs').get().count;
    if (needsCount === 0) {
        const insertNeed = db.prepare(`
            INSERT INTO urgent_needs (org_name, category, title, description, target_amount, raised_amount, urgency)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        insertNeed.run('Shanti Niketan', 'oldage', '50 Thermal Blankets for Winter', 'Winter approaches in Haridwar. 45 elderly residents urgently require warm blankets.', 25000, 17500, 'Urgent');
        insertNeed.run('Anand Old Age Home', 'oldage', 'Monthly Diabetes & Heart Medicines', 'Critical monthly prescription medicines for 28 senior citizens.', 18000, 11200, 'High');
        insertNeed.run('Gandhi Orphanage', 'orphanage', 'School Books & Uniforms for 40 Kids', 'New academic session supplies and uniforms for newly enrolled children.', 15000, 9500, 'High');

        console.log('✅ Urgent needs seeded into SQLite database.');
    }

    // Seed Chat Messages if empty
    const chatCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get().count;
    if (chatCount === 0) {
        const insertChat = db.prepare('INSERT INTO chat_messages (sender_name, sender_role, message) VALUES (?, ?, ?)');
        insertChat.run('SevaSetu Support', 'admin', 'Namaste! Welcome to SevaSetu Live Support. How can we help you today?');
        insertChat.run('Gandhi Orphanage', 'orphanage', 'Hello donors! We welcome weekend visitors. Please feel free to ask any questions.');
        console.log('✅ Baseline chat messages seeded.');
    }
}

initDatabase();

module.exports = db;
