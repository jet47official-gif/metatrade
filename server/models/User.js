import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  full_name: {
    type: String,
    default: ''
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  avatar: {
    type: String,
    default: ''
  },

  // Account balances
  balance: {
    type: Number,
    default: 0
  },

  frozen_balance: {
    type: Number,
    default: 0
  },

  total_profit: {
    type: Number,
    default: 0
  },

  total_deposited: {
    type: Number,
    default: 0
  },

  total_withdrawn: {
    type: Number,
    default: 0
  },

  identity_status: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified'
  },

  date_of_birth: {
    type: String,
    default: ''
  },

  mobile: {
    type: String,
    default: ''
  },

  country_code: {
    type: String,
    default: ''
  },

  credit_score: {
    type: Number,
    default: 100
  },

  referral_code: {
    type: String,
    unique: true,
    sparse: true
  },

  referred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  referrals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  referral_earnings: {
    type: Number,
    default: 0
  },

  withdrawal_enabled: {
    type: Boolean,
    default: true
  },

  trading_enabled: {
    type: Boolean,
    default: true
  },

  premium_enabled: {
    type: Boolean,
    default: false
  },

  login_password: {
    type: String,
    select: false
  },

  withdrawal_password: {
    type: String,
    select: false
  },

  language: {
    type: String,
    default: 'en'
  },

  otp_code: {
    type: String,
    select: false
  },

  otp_expires: {
    type: Date,
    select: false
  },

  google_id: {
    type: String,
    default: null,
    sparse: true
  }

}, {
  timestamps: true
});


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});


// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// Remove sensitive fields from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.login_password;
  delete obj.withdrawal_password;
  delete obj.otp_code;
  delete obj.otp_expires;

  return obj;
};


export default mongoose.model('User', userSchema);
