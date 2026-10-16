import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { type, amount, method, wallet_address, tx_hash } = req.body;
    if (!type || amount === undefined || amount === null || amount === '') {
      return res.status(400).json({ message: 'Type and amount are required' });
    }

    const finalAmount = Number(amount);
    const finalMethod = method || 'USDT_TRC20';

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount' });
    }

    const user = await User.findById(req.user._id);

    if (type === 'withdrawal') {
      if (!user.withdrawal_enabled) {
        return res.status(400).json({ message: 'Withdrawals are disabled for your account' });
      }
      if (user.balance < finalAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
    }

    const transaction = await Transaction.create({
      user_id: req.user._id,
      user_email: req.user.email,
      type,
      amount: finalAmount,
      method: finalMethod,
      wallet_address: wallet_address || '',
      tx_hash: tx_hash || '',
    });

    await Notification.create({
      user_id: req.user._id,
      user_email: 'admin',
      title: type === 'deposit' ? 'New Deposit Request' : 'New Withdrawal Request',
      message: `${req.user.email} requested a ${type} of $${finalAmount} via ${finalMethod}`,
      type: type === 'deposit' ? 'deposit_request' : 'withdrawal_request',
      related_id: transaction._id.toString(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    transaction.status = 'approved';
    transaction.admin_note = `Approved by admin on ${new Date().toISOString()}`;
    await transaction.save();

    const user = await User.findById(transaction.user_id);
    if (user) {
      if (transaction.type === 'deposit') {
        user.balance += transaction.amount;
        user.total_deposited += transaction.amount;
      } else {
        user.balance = Math.max(0, user.balance - transaction.amount);
        user.total_withdrawn += transaction.amount;
      }
      await user.save();
    }

    await Notification.create({
      user_id: transaction.user_id,
      user_email: transaction.user_email,
      title: `${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Approved`,
      message: `Your ${transaction.type} of $${transaction.amount} has been approved.`,
      type: transaction.type === 'deposit' ? 'deposit_approved' : 'withdrawal_approved',
      related_id: transaction._id.toString(),
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = 'rejected';
    transaction.admin_note = reason || 'Rejected by admin';
    await transaction.save();

    await Notification.create({
      user_id: transaction.user_id,
      user_email: transaction.user_email,
      title: `${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Rejected`,
      message: `Your ${transaction.type} of $${transaction.amount} has been rejected. ${reason || ''}`,
      type: transaction.type === 'deposit' ? 'deposit_rejected' : 'withdrawal_rejected',
      related_id: transaction._id.toString(),
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
