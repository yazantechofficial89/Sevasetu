/**
 * SevaSetu MongoDB Integration & Mongoose Connection
 * Provides high-performance document database storage for users, donations, organizations, needs & chat.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const models = require('./models');
const { User, Donation, Organization, UrgentNeed, ChatMessage, PasswordReset, MobileOtp } = models;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sevasetu';

let isConnected = false;

async function connectMongoDB() {
    if (isConnected) return mongoose.connection;

    try {
        console.log(`🍃 Connecting to MongoDB at: ${MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ':$1***@')}...`);
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Fast fail in 5s if not running
        });
        isConnected = true;
        console.log('✅ [MongoDB] Connected successfully to database: ' + conn.connection.name);

        // Seed initial collections if empty
        await seedDefaultMongoData();

        return conn;
    } catch (err) {
        isConnected = false;
        console.warn('⚠️ [MongoDB Notice] Could not connect to MongoDB:', err.message);
        console.warn('💡 Tip: Set MONGODB_URI in .env (e.g. MongoDB Atlas cluster string or start local mongod).');
        return null;
    }
}

// Seed default users, organizations & donations in MongoDB if empty
async function seedDefaultMongoData() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('🌱 Seeding initial MongoDB users...');
            const hash1 = bcrypt.hashSync('123456', 10);
            const hash2 = bcrypt.hashSync('12345', 10);
            const hash3 = bcrypt.hashSync('701190', 10);
            const adminHash = bcrypt.hashSync('admin123', 10);

            await User.insertMany([
                {
                    role: 'admin',
                    name: 'SevaSetu Admin',
                    email: 'admin@sevasetu.org',
                    mobile: '9999999999',
                    city: 'National HQ',
                    password: adminHash,
                    manager: 'Administrator',
                    status: 'approved'
                },
                {
                    role: 'donor',
                    name: 'Gaurav Yadav',
                    email: 'ggy318928@gmail.com',
                    mobile: '9876543210',
                    city: 'Delhi',
                    password: hash1,
                    status: 'approved'
                },
                {
                    role: 'oldage',
                    name: 'Happy Old Age Home',
                    email: 'sevasetu@gmail.com',
                    mobile: '9170119069',
                    city: 'Delhi',
                    password: hash2,
                    manager: 'Director',
                    status: 'approved'
                },
                {
                    role: 'orphanage',
                    name: 'Sunrise Orphanage',
                    email: 'yazangupta233@gmail.com',
                    mobile: '9170119069',
                    city: 'Mumbai',
                    password: hash3,
                    manager: 'Yazan Gupta',
                    status: 'approved'
                }
            ]);
            console.log('✅ Default users & admin seeded into MongoDB.');
        }

        const orgCount = await Organization.countDocuments();
        if (orgCount === 0) {
            await Organization.insertMany([
                { name: 'Sunrise Orphanage', type: 'orphanage', city: 'Mumbai', needs: 'Textbooks, Winter Uniforms & Nutrition Kits', verified: true },
                { name: 'Happy Old Age Home', type: 'oldage', city: 'Delhi', needs: 'Prescription Medicines & Daily Rations', verified: true },
                { name: 'Bal Asha Trust', type: 'orphanage', city: 'Mumbai', needs: 'Baby Care Formula & Pre-School Toys', verified: true },
                { name: 'Care & Love Old Age Home', type: 'oldage', city: 'Delhi', needs: 'Wheelchairs & Hot Water Heaters', verified: true },
                { name: 'Snehalaya Children Home', type: 'orphanage', city: 'Pune', needs: 'Computer Lab Equipment & Solar Lighting', verified: true },
                { name: 'Vridh Seva Ashram', type: 'oldage', city: 'Jaipur', needs: 'Warm Blankets & Cataract Surgery Fund', verified: true }
            ]);
            console.log('✅ Default organizations seeded into MongoDB.');
        }

        const donationCount = await Donation.countDocuments();
        if (donationCount === 0) {
            await Donation.insertMany([
                { donationId: 'DON-847291', order_id: 'order_demo_1', payment_id: 'pay_demo_847291', amount: 2000, currency: 'INR', donor_name: 'Gaurav Yadav', donor_email: 'ggy318928@gmail.com', org_name: 'Sunrise Orphanage', cause_type: 'Food & Books', method: 'Razorpay', status: 'Success' },
                { donationId: 'DON-847290', order_id: 'order_demo_2', payment_id: 'pay_demo_847290', amount: 1500, currency: 'INR', donor_name: 'Gaurav Yadav', donor_email: 'ggy318928@gmail.com', org_name: 'Happy Old Age Home', cause_type: 'Food & Groceries', method: 'UPI QR', status: 'Success' },
                { donationId: 'DON-847289', order_id: 'order_demo_3', payment_id: 'pay_demo_847289', amount: 8500, currency: 'INR', donor_name: 'Gaurav Yadav', donor_email: 'ggy318928@gmail.com', org_name: 'Care & Love Old Age Home', cause_type: 'Medical Care & Medicines', method: 'Razorpay', status: 'Success' }
            ]);
            console.log('✅ Baseline donations seeded into MongoDB.');
        }

        const needCount = await UrgentNeed.countDocuments();
        if (needCount === 0) {
            await UrgentNeed.insertMany([
                { org_name: 'Sunrise Orphanage', category: 'Education', title: 'Winter Term Books & Stationeries', description: 'Urgent supplies needed for 45 children starting new school term.', target_amount: 35000, raised_amount: 14200, urgency: 'High' },
                { org_name: 'Happy Old Age Home', category: 'Medical', title: 'Monthly Blood Sugar & BP Medicines', description: 'Chronic care medicines for 32 elderly residents.', target_amount: 25000, raised_amount: 18500, urgency: 'Critical' },
                { org_name: 'Bal Asha Trust', category: 'Nutrition', title: 'Infant Milk Formula & Supplementary Food', description: 'Essential nutrition support for abandoned infants under age 3.', target_amount: 40000, raised_amount: 21000, urgency: 'High' }
            ]);
            console.log('✅ Urgent needs seeded into MongoDB.');
        }
    } catch (err) {
        console.error('Mongo Seed Error:', err.message);
    }
}

// Migration tool: Migrate data from existing SQLite to MongoDB
async function migrateFromSqlite(sqliteDb) {
    if (!isConnected) {
        const ok = await connectMongoDB();
        if (!ok) throw new Error('Cannot migrate: MongoDB connection failed.');
    }

    console.log('🔄 Migrating all records from SQLite to MongoDB...');

    // 1. Users
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const u of users) {
        await User.findOneAndUpdate(
            { email: u.email.toLowerCase() },
            {
                role: u.role,
                name: u.name,
                email: u.email.toLowerCase(),
                mobile: u.mobile || '',
                city: u.city || 'India',
                password: u.password,
                manager: u.manager || '',
                address: u.address || '',
                extra_info: u.extra_info || '',
                status: u.status || 'approved'
            },
            { upsert: true, new: true }
        );
    }
    console.log(`✅ Migrated ${users.length} users to MongoDB.`);

    // 2. Organizations
    const orgs = sqliteDb.prepare('SELECT * FROM organizations').all();
    for (const o of orgs) {
        await Organization.findOneAndUpdate(
            { name: o.name },
            {
                name: o.name,
                type: o.type,
                city: o.city || 'India',
                needs: o.needs || 'Care & General Support',
                verified: Boolean(o.verified)
            },
            { upsert: true, new: true }
        );
    }
    console.log(`✅ Migrated ${orgs.length} organizations to MongoDB.`);

    // 3. Donations
    const donations = sqliteDb.prepare('SELECT * FROM donations').all();
    for (const d of donations) {
        await Donation.findOneAndUpdate(
            { donationId: d.id },
            {
                donationId: d.id,
                order_id: d.order_id || '',
                payment_id: d.payment_id || '',
                amount: d.amount,
                currency: d.currency || 'INR',
                donor_name: d.donor_name || 'Anonymous',
                donor_email: (d.donor_email || '').toLowerCase(),
                org_name: d.org_name,
                cause_type: d.cause_type || 'General Support',
                method: d.method || 'Razorpay',
                status: d.status || 'Success'
            },
            { upsert: true, new: true }
        );
    }
    console.log(`✅ Migrated ${donations.length} donations to MongoDB.`);

    return { success: true, users: users.length, organizations: orgs.length, donations: donations.length };
}

module.exports = {
    connectMongoDB,
    seedDefaultMongoData,
    migrateFromSqlite,
    models,
    ...models,
    get isConnected() { return isConnected; }
};
