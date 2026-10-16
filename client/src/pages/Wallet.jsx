import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Wallet, CircleArrowDown, CircleArrowUp, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/utils'

export default function WalletPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('deposit')
  const [selectedCurrency, setSelectedCurrency] = useState('USDT_TRC20')
  const [walletAddresses, setWalletAddresses] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const [depositAmount, setDepositAmount] = useState('')
  const [depositTxHash, setDepositTxHash] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)

  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const currencies = [
    { value: 'USDT_TRC20', label: 'USDT (TRC20)', network: 'TRON (TRC20)' },
    { value: 'USDT_ERC20', label: 'USDT (ERC20)', network: 'Ethereum (ERC20)' },
    { value: 'BTC', label: 'Bitcoin (BTC)', network: 'Bitcoin' },
    { value: 'ETH', label: 'Ethereum (ETH)', network: 'Ethereum' },
    { value: 'USDC', label: 'USD Coin (USDC)', network: 'Ethereum' },
  ]

  const quickAmounts = [50, 100, 250, 500]

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setDepositAmount('')
    setDepositTxHash('')
    setWithdrawAddress('')
    setWithdrawAmount('')
  }, [activeTab, selectedCurrency])

  async function fetchData() {
    try {
      const [walletsRes, txRes] = await Promise.all([
        api.get('/wallets'),
        api.get('/transactions'),
      ])
      setWalletAddresses(walletsRes.data)
      setTransactions(txRes.data)
    } catch (err) {
      console.error('Failed to fetch wallet data:', err)
    } finally {
      setLoading(false)
    }
  }

  function copyAddress(address) {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getNetwork(currency) {
    const c = currencies.find(c => c.value === currency)
    return c ? c.network : currency
  }

  function getCurrencyLabel(currency) {
    const c = currencies.find(c => c.value === currency)
    return c ? c.label : currency
  }

  async function handleDeposit(e) {
    e.preventDefault()
    setDepositLoading(true)
    try {
      await api.post('/transactions', {
        type: 'deposit',
        method: selectedCurrency,
        amount: parseFloat(depositAmount),
        tx_hash: depositTxHash || undefined,
      })
      setDepositAmount('')
      setDepositTxHash('')
      const txRes = await api.get('/transactions')
      setTransactions(txRes.data)
    } catch (err) {
      console.error('Deposit request failed:', err)
    } finally {
      setDepositLoading(false)
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault()
    setWithdrawLoading(true)
    try {
      await api.post('/transactions', {
        type: 'withdrawal',
        method: selectedCurrency,
        amount: parseFloat(withdrawAmount),
        wallet_address: withdrawAddress,
      })
      setWithdrawAddress('')
      setWithdrawAmount('')
      const txRes = await api.get('/transactions')
      setTransactions(txRes.data)
    } catch (err) {
      console.error('Withdrawal request failed:', err)
    } finally {
      setWithdrawLoading(false)
    }
  }

  const balance = user?.balance || 0
  const currentAddress = walletAddresses.find(w => {
    if (w.currency === selectedCurrency) return true
    if (w.currency === 'USDT' && selectedCurrency.startsWith('USDT_')) {
      const expectedNetwork = selectedCurrency.endsWith('_TRC20') ? 'TRC20' : selectedCurrency.endsWith('_ERC20') ? 'ERC20' : ''
      return !expectedNetwork || w.network === expectedNetwork
    }
    return false
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-zinc-900 border border-gold-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-gold-500" />
          </div>
          <p className="text-sm text-zinc-400">Available Balance</p>
          <p className="text-3xl font-bold text-zinc-50">
            {formatCurrency(balance)} USDT
          </p>
          {!user?.withdrawal_enabled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-600 border border-red-500/25">
              <AlertTriangle className="w-3 h-3" />
              Withdrawals Disabled
            </span>
          )}
        </div>
      </div>

      <div className="flex bg-zinc-900 border border-gold-100 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'deposit'
              ? 'bg-gold-50 text-gold-600 border border-gold-200'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <CircleArrowDown className="w-4 h-4" />
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'withdraw'
              ? 'bg-gold-50 text-gold-600 border border-gold-200'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <CircleArrowUp className="w-4 h-4" />
          Withdraw
        </button>
      </div>

      <div className="bg-zinc-900 border border-gold-100 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-200 mb-2">Select Currency</label>
          <select
            value={selectedCurrency}
            onChange={e => setSelectedCurrency(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          >
            {currencies.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit} className="space-y-4">
            {currentAddress && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <p className="text-sm text-zinc-400">
                  Send <span className="text-zinc-100 font-medium">{getCurrencyLabel(selectedCurrency)}</span> to this address
                </p>
                <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-4 py-3 border border-zinc-800">
                  <code className="flex-1 text-sm text-gold-600 font-mono break-all select-all">
                    {currentAddress.address}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyAddress(currentAddress.address)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/15 border border-amber-500/30">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Only send via <span className="font-medium">{getNetwork(selectedCurrency)}</span> network. Sending any other asset may result in permanent loss.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-200">Amount (USDT)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                required
              />
              <div className="flex gap-2">
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDepositAmount(amount.toString())}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      depositAmount === amount.toString()
                        ? 'bg-gold-50 text-gold-600 border border-gold-200'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-200">Transaction Hash (Optional)</label>
              <input
                type="text"
                value={depositTxHash}
                onChange={e => setDepositTxHash(e.target.value)}
                placeholder="Enter tx hash after sending"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              disabled={depositLoading || !depositAmount}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gold-500 text-black font-semibold hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {depositLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CircleArrowDown className="w-5 h-5" />
              )}
              Submit Deposit Request
            </button>

            <p className="text-xs text-zinc-400 text-center">
              Deposits are manually approved by admin.
            </p>
          </form>
        )}

        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-200">Withdrawal Address</label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={`Enter your ${getCurrencyLabel(selectedCurrency)} address`}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-200">Amount (USDT)</label>
              <input
                type="number"
                min="1"
                max={balance}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                required
              />
              <p className="text-xs text-zinc-400">Max: {formatCurrency(balance)} USDT</p>
            </div>

            <button
              type="submit"
              disabled={withdrawLoading || !withdrawAmount || !withdrawAddress || !user?.withdrawal_enabled}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gold-500 text-black font-semibold hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {withdrawLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CircleArrowUp className="w-5 h-5" />
              )}
              Submit Withdrawal Request
            </button>

            <p className="text-xs text-zinc-400 text-center">
              Withdrawals are manually approved by admin.
            </p>
          </form>
        )}
      </div>

      <div className="bg-zinc-900 border border-gold-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-50 mb-4">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-400">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Type</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Method</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-zinc-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-zinc-900">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit' ? (
                          <CircleArrowDown className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <CircleArrowUp className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="capitalize text-zinc-100">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-zinc-100 font-medium">
                      {formatCurrency(tx.amount)} USDT
                    </td>
                    <td className="py-3 px-2 text-zinc-400">{tx.method}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        tx.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : tx.status === 'rejected'
                          ? 'bg-red-500/15 text-red-600'
                          : 'bg-amber-500/15 text-amber-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-zinc-400">{formatDate(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
