import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import WalletAddress from './models/WalletAddress.js';

dotenv.config();

const ensureSeed = async () => {
  try {
    const count = await User.countDocuments({});
    if (count > 0) return;

    console.log('[DB] Empty database - seeding default accounts...');

    await User.create({
      email: 'admin@metatrade.com',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'admin',
      balance: 0,
      is_verified: true,
      credit_score: 1000,
      identity_status: 'verified',
    });

    await User.create({
      email: 'user@metatrade.com',
      password: 'user123',
      full_name: 'John Trader',
      role: 'user',
      balance: 5000,
      total_deposited: 5000,
      is_verified: true,
      credit_score: 450,
      identity_status: 'verified',
      premium_enabled: true,
    });

    await User.create({
      email: 'demo@metatrade.com',
      password: 'demo123',
      full_name: 'Demo User',
      role: 'user',
      balance: 1000,
      total_deposited: 1000,
      is_verified: true,
      credit_score: 250,
      identity_status: 'verified',
    });

    await WalletAddress.insertMany([
      { currency: 'USDT_TRC20', address: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', label: 'USDT TRC20 Main', network: 'TRC20' },
      { currency: 'USDT_ERC20', address: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', label: 'USDT ERC20 Main', network: 'ERC20' },
      { currency: 'BTC', address: '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', label: 'BTC Main', network: 'Bitcoin' },
      { currency: 'ETH', address: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', label: 'ETH Main', network: 'Ethereum' },
      { currency: 'USDC', address: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', label: 'USDC Main', network: 'Ethereum' },
    ]);

    console.log('[DB] Seed completed!');
    console.log('[DB] Admin: admin@metatrade.com / admin123');
    console.log('[DB] User (Premium): user@metatrade.com / user123');
    console.log('[DB] User (Regular): demo@metatrade.com / demo123');
  } catch (error) {
    console.error('[DB] Seed error: ' + error.message);
  }
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri || uri.includes('your-username') || uri.includes('<password>')) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('[DB] No MONGODB_URI - started in-memory MongoDB (local dev)');
    }

    const conn = await mongoose.connect(uri);
    console.log('[DB] MongoDB connected: ' + conn.connection.host);

    await ensureSeed();
  } catch (error) {
    console.error('[DB] MongoDB connection error: ' + error.message);
    throw error;
  }
};

export default connectDB;
