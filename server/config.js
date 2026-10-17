import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import WalletAddress from './models/WalletAddress.js';

dotenv.config();

const here = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(here, 'node_modules', '.cache', 'mongodb-memory-server');

// Only use in-memory MongoDB if its binary is ALREADY present,
// so startup never hangs trying to download the large mongod binary.
function hasLocalBinary() {
  try {
    if (!fs.existsSync(cacheDir)) return false;
    const stack = [cacheDir];
    while (stack.length) {
      const d = stack.pop();
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) stack.push(full);
        else if (e.name === 'mongod.exe') return true;
      }
    }
    return false;
  } catch (e) { return false; }
}

const ensureSeed = async () => {
  try {
    const count = await User.countDocuments({});
    if (count > 0) return;

    console.log('[DB] Empty database - seeding default accounts...');

    await User.create({
      email: 'admin@metatrade.com', password: 'admin123', full_name: 'Admin User',
      role: 'admin', balance: 0, is_verified: true, credit_score: 1000, identity_status: 'verified',
    });
    await User.create({
      email: 'user@metatrade.com', password: 'user123', full_name: 'John Trader',
      role: 'user', balance: 5000, total_deposited: 5000, is_verified: true,
      credit_score: 450, identity_status: 'verified', premium_enabled: true,
    });
    await User.create({
      email: 'demo@metatrade.com', password: 'demo123', full_name: 'Demo User',
      role: 'user', balance: 1000, total_deposited: 1000, is_verified: true,
      credit_score: 250, identity_status: 'verified',
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
    const needsPlaceholder = !uri || uri.includes('your-username') || uri.includes('<password>');

    if (needsPlaceholder) {
      if (hasLocalBinary()) {
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          uri = mongod.getUri();
          console.log('[DB] No MONGODB_URI - started in-memory MongoDB');
        } catch (e) {
          console.log('[DB] In-memory MongoDB failed: ' + e.message);
        }
      } else {
        console.log('[DB] No MONGODB_URI and no local MongoDB binary.');
      }
    }

    if (!uri) {
      console.log('[DB] Running WITHOUT a database. Set MONGODB_URI in server/.env (MongoDB Atlas) to enable login & data.');
      return;
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('[DB] MongoDB connected: ' + mongoose.connection.host);
    await ensureSeed();
  } catch (error) {
    console.log('[DB] WARNING: MongoDB not connected (' + error.message + ').');
    console.log('[DB] Server still running, but login/data are disabled until MONGODB_URI is set.');
  }
};

export default connectDB;
