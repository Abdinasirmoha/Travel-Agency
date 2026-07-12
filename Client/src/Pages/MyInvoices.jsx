import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomer } from '../context/AuthContext';
import {
  FileText, CreditCard, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, X, Globe, Smartphone,
  Building2, DollarSign, Calendar, ShieldCheck, Loader2,
  ArrowRight, Receipt, BadgeCheck, Plane, MapPin, Tag, Stamp, Zap
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

import { API_BASE_URL as API } from '../config/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ invoice, amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const res = await fetch(`${API}/stripe/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            invoiceId: invoice._id,
            amountPaid: amount,
            currency: invoice.currency || 'USD'
          })
        });
        const data = await res.json();
        if (res.ok) {
          onSuccess(data.payment || { receiptNumber: 'REC-' + Date.now(), amountPaid: amount, currency: 'USD' });
        } else {
          setError(data.message || 'Payment confirmation failed');
        }
      } catch (err) {
        setError('Server error during confirmation');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} disabled={loading} className="flex-1 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" disabled={!stripe || loading} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${Number(amount).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

// ─── API ────────────────────────────────────────────────────────────────────
async function fetchCustomerInvoices(customerId) {
  const res = await fetch(`${API}/invoices`);
  if (!res.ok) throw new Error('Failed to load invoices');
  const all = await res.json();
  return all.filter(inv => {
    const cid = typeof inv.customer === 'object' ? inv.customer._id : inv.customer;
    return cid === customerId;
  });
}
async function submitPayment(data) {
  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Payment failed');
  return json;
}

// ─── Invoice type detection ─────────────────────────────────────────────────
// Looks at linkedItemType of items OR guesses from description keywords
function detectInvoiceType(inv) {
  const items = inv.items || [];
  // Check linked types first
  const types = [...new Set(items.map(i => i.linkedItemType).filter(Boolean))];
  if (types.length === 1) return types[0];
  if (types.length > 1)   return 'Mixed';

  // Fallback: guess from descriptions
  const desc = items.map(i => (i.description || '').toLowerCase()).join(' ');
  if (desc.includes('flight') || desc.includes('ticket') || desc.includes('airline')) return 'Ticket';
  if (desc.includes('visa') || desc.includes('passport') || desc.includes('embassy')) return 'Visa';
  if (desc.includes('tour') || desc.includes('package') || desc.includes('holiday')) return 'Tour';
  if (desc.includes('cargo') || desc.includes('freight') || desc.includes('shipment')) return 'Cargo';
  return 'General';
}

const typeConfig = {
  Ticket:  { label: 'Flight Ticket', icon: Plane,    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badgeBg: 'bg-blue-600'   },
  Visa:    { label: 'Visa Service',  icon: Stamp,    bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',badgeBg: 'bg-emerald-600'},
  Tour:    { label: 'Tour Package',  icon: MapPin,   bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badgeBg: 'bg-amber-500'  },
  Cargo:   { label: 'Cargo',         icon: Tag,      bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badgeBg: 'bg-purple-600' },
  Mixed:   { label: 'Multiple',      icon: FileText, bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  badgeBg: 'bg-slate-500'  },
  General: { label: 'General',       icon: FileText, bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  badgeBg: 'bg-slate-500'  },
};

// Per-item type config for the line items table
const itemTypeConfig = {
  Ticket:  { icon: Plane,    label: 'Flight', color: 'text-blue-600',    bg: 'bg-blue-50'   },
  Visa:    { icon: Stamp,    label: 'Visa',   color: 'text-emerald-600', bg: 'bg-emerald-50' },
  Tour:    { icon: MapPin,   label: 'Tour',   color: 'text-amber-600',   bg: 'bg-amber-50'  },
  Cargo:   { icon: Tag,      label: 'Cargo',  color: 'text-purple-600',  bg: 'bg-purple-50' },
};

// ─── Status config ───────────────────────────────────────────────────────────
const statusConfig = {
  Paid:             { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Partially Paid': { color: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500'    },
  Unpaid:           { color: 'bg-red-100 text-red-700 border-red-200',             dot: 'bg-red-500'     },
  Draft:            { color: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400'   },
};

const paymentProviders = [
  { id: 'Cash', label: 'Cash', icon: DollarSign, type: 'Cash', isFast: false, desc: 'Pay in person' },
  { id: 'EVC Plus', label: 'EVC Plus', icon: Smartphone, type: 'Mobile Money', isFast: true, desc: 'Hormuud / Telesom EVC wallet' },
  { id: 'Zaad', label: 'Zaad', icon: Smartphone, type: 'Mobile Money', isFast: true, desc: 'Telesom Zaad Service' },
  { id: 'Sahal', label: 'Sahal', icon: Smartphone, type: 'Mobile Money', isFast: true, desc: 'Golis Sahal Service' },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: Building2, type: 'Bank Transfer', isFast: false, desc: 'Manual transfer' },
  { id: 'Credit Card', label: 'Credit Card', icon: CreditCard, type: 'Credit Card', isFast: false, desc: 'Powered by Stripe' },
];

// ═══════════════════════════════════════════════════════════════════════════════
export default function MyInvoices() {
  const { customer } = useCustomer();
  const [invoices, setInvoices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [expandedId, setExpandedId]       = useState(null);
  const [payInvoice, setPayInvoice]       = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [filterType, setFilterType]       = useState('All');

  // Payment form
  const [payStep, setPayStep]             = useState(1); // 1 = Select Method, 2 = Enter Details
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payRef, setPayRef]       = useState('');
  const [payerAccountNo, setPayerAccountNo] = useState('');
  const [paying, setPaying]       = useState(false);
  const [payError, setPayError]   = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);

  const load = async () => {
    if (!customer?._id) return;
    setLoading(true); setError('');
    try {
      const data = await fetchCustomerInvoices(customer._id);
      setInvoices(data);
    } catch (e) { setError(e.message); }
    finally      { setLoading(false); }
  };

  useEffect(() => { load(); }, [customer]);

  const openPay = (inv) => {
    setPayInvoice(inv);
    setPayStep(1);
    setSelectedProvider(null);
    setPayAmount(Math.max(0, (inv.totalAmount || 0) - (inv.amountPaid || 0)));
    setPayRef(''); setPayError(''); setSuccessReceipt(null); setPayerAccountNo('');
  };
  const closePay = () => { setPayInvoice(null); setSuccessReceipt(null); setClientSecret(''); };

  const handleProviderSelect = (provider) => {
    if (provider.type === 'Cash' || provider.type === 'Bank Transfer') {
      setPayError(`${provider.label} is currently not supported for online payment.`);
      return;
    }
    setPayError('');
    setSelectedProvider(provider);
    if (provider.type === 'Credit Card') {
      initiateStripePayment();
    } else {
      setPayStep(2);
    }
  };

  const initiateStripePayment = async () => {
    setStripeLoading(true);
    setPayStep(3); // Step 3 will be Stripe Elements
    try {
      const res = await fetch(`${API}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payInvoice._id,
          amount: payAmount,
          currency: payInvoice.currency || 'USD'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setClientSecret(data.clientSecret);
      } else {
        setPayError(data.message || 'Failed to initialize payment gateway.');
        setPayStep(1);
      }
    } catch (err) {
      setPayError('Failed to connect to payment gateway.');
      setPayStep(1);
    }
    setStripeLoading(false);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) { setPayError('Enter a valid amount.'); return; }

    // Normalize phone: strip all non-digits, then ensure 252 prefix
    let normalizedPhone = payerAccountNo.replace(/[^\d]/g, '');
    if (normalizedPhone.startsWith('0'))       normalizedPhone = '252' + normalizedPhone.slice(1);
    else if (!normalizedPhone.startsWith('252')) normalizedPhone = '252' + normalizedPhone;

    if (normalizedPhone.length < 11) {
      setPayError('Please enter a valid Somali mobile wallet number (e.g. 252615123456).');
      return;
    }

    setPaying(true); setPayError('');
    try {
      const receipt = await submitPayment({
        receiptNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        customer:      customer._id,
        invoice:       payInvoice._id,
        amountPaid:    Number(payAmount),
        paymentDate:   new Date().toISOString().split('T')[0],
        paymentMethod: selectedProvider?.type || 'Mobile Money',
        payerAccountNo: normalizedPhone,
        reference:     payRef || `ONLINE-${Date.now()}`,
        currency:      payInvoice.currency || 'USD',
      });
      setSuccessReceipt(receipt);
      await load();
    } catch (err) { setPayError(err.message); }
    finally       { setPaying(false); }
  };


  // Poll for pending payment status
  useEffect(() => {
    let interval;
    if (successReceipt && successReceipt.status === 'Pending') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API}/payments/${successReceipt._id}`);
          if (res.ok) {
            const updatedPayment = await res.json();
            if (updatedPayment.status === 'Completed' || updatedPayment.status === 'Failed') {
              setSuccessReceipt(updatedPayment);
              await load();
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [successReceipt]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalAmount      = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalPaid        = invoices.reduce((s, i) => s + (i.amountPaid  || 0), 0);
  const totalOutstanding = totalAmount - totalPaid;
  const unpaidCount      = invoices.filter(i => i.status !== 'Paid').length;

  // ── Filter by type ──────────────────────────────────────────────────────────
  const filtered = filterType === 'All'
    ? invoices
    : invoices.filter(inv => detectInvoiceType(inv) === filterType);

  const typeCounts = { All: invoices.length };
  invoices.forEach(inv => {
    const t = detectInvoiceType(inv);
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 pt-28 pb-16 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-20 w-80 h-80 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '35s' }} />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <p className="text-primary-100 font-bold tracking-wider uppercase text-sm">My Account</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">My Invoices & Payments</h1>
          <p className="text-primary-50 text-lg max-w-xl font-medium drop-shadow-sm">
            View all invoices for your flights, visas and tour packages — and pay outstanding balances online instantly.
          </p>
          {!loading && (
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { label: 'Total Invoices', value: invoices.length,  color: 'bg-white/10 text-white border border-white/20' },
                { label: 'Billed',   value: `$${totalAmount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: 'bg-white/10 text-white border border-white/20' },
                { label: 'Paid',     value: `$${totalPaid.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,   color: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40' },
                { label: 'Due',      value: `$${totalOutstanding.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: totalOutstanding > 0 ? 'bg-red-500/20 text-red-100 border border-red-400/40' : 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${color} shadow-sm`}>
                  {label}: <span className="font-bold ml-1">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 -mt-8 mb-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FileText,    label: 'Total Invoices', value: invoices.length,  sub: 'All time',   color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100' },
            { icon: DollarSign,  label: 'Total Billed',   value: `$${totalAmount.toLocaleString()}`, sub: 'All invoices', color: 'text-slate-700',  bg: 'bg-slate-50',   border: 'border-slate-200'   },
            { icon: CheckCircle, label: 'Amount Paid',    value: `$${totalPaid.toLocaleString()}`,   sub: 'Cleared',      color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { icon: AlertCircle, label: 'Outstanding',    value: `$${totalOutstanding.toLocaleString()}`, sub: unpaidCount > 0 ? `${unpaidCount} invoice${unpaidCount>1?'s':''} pending` : 'All clear', color: totalOutstanding > 0 ? 'text-red-500' : 'text-emerald-600', bg: totalOutstanding > 0 ? 'bg-red-50' : 'bg-emerald-50', border: totalOutstanding > 0 ? 'border-red-200' : 'border-emerald-200' },
          ].map(({ icon: Icon, label, value, sub, color, bg, border }) => (
            <div key={label} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${border} hover:border-primary-200 hover:shadow-md transition-all duration-300`}>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-black mt-1 ${color}`}>{loading ? '—' : value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Type Filter Tabs ─────────────────────────────────────────────────── */}
      {!loading && invoices.length > 0 && (
        <div className="container mx-auto px-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {['All', 'Ticket', 'Visa', 'Tour', 'Cargo', 'General'].filter(t => t === 'All' || typeCounts[t] > 0).map(t => {
              const cfg = typeConfig[t];
              const Icon = cfg?.icon || FileText;
              const isActive = filterType === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    isActive
                      ? `${cfg?.badgeBg || 'bg-primary-600'} text-white border-transparent shadow-md hover:-translate-y-0.5`
                      : `bg-white ${cfg?.text || 'text-slate-600'} ${cfg?.border || 'border-slate-200'} hover:border-primary-300 hover:shadow-sm`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t === 'All' ? 'All Invoices' : cfg?.label || t}
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isActive ? 'bg-white/20' : `${cfg?.bg || 'bg-slate-100'}`}`}>
                    {typeCounts[t] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Invoice List ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 pb-24">
        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Invoice History
          {filterType !== 'All' && <span className="text-sm font-medium text-slate-400">— filtered by {typeConfig[filterType]?.label}</span>}
        </h2>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-400" />
            <p className="font-medium">Loading your invoices…</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">{error}</p>
            <button onClick={load} className="mt-3 text-sm font-bold underline hover:text-red-800">Retry</button>
          </div>
        )}
        {!loading && !error && invoices.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-800 mb-2">No Invoices Yet</p>
            <p className="text-slate-500 font-medium">Your invoices will appear here once the admin creates them for your bookings.</p>
          </div>
        )}
        {!loading && !error && invoices.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-10 text-center">
            <p className="text-slate-500 font-medium">No invoices of this type found.</p>
            <button onClick={() => setFilterType('All')} className="mt-3 text-sm font-bold text-primary-600 hover:text-primary-700 underline">Clear filter</button>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map(inv => {
            const invType  = detectInvoiceType(inv);
            const tCfg     = typeConfig[invType] || typeConfig.General;
            const TypeIcon = tCfg.icon;
            const sCfg     = statusConfig[inv.status] || statusConfig.Draft;
            const outstanding = Math.max(0, (inv.totalAmount || 0) - (inv.amountPaid || 0));
            const isExpanded  = expandedId === inv._id;

            return (
              <div key={inv._id} className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 overflow-hidden hover:border-primary-200 hover:shadow-lg transition-all duration-300">
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer select-none group"
                  onClick={() => setExpandedId(isExpanded ? null : inv._id)}
                >
                  <div className={`w-14 h-14 rounded-2xl ${tCfg.bg} border-2 ${tCfg.border} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <TypeIcon className={`w-7 h-7 ${tCfg.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-slate-900 text-lg">{inv.invoiceNumber}</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${tCfg.bg} ${tCfg.text} ${tCfg.border} shadow-sm`}>
                        <TypeIcon className="w-3 h-3" />
                        {tCfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><Calendar className="w-3 h-3 text-slate-400" /> {new Date(inv.date).toLocaleDateString()}</span>
                      <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{inv.items?.length || 0} item{inv.items?.length !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100"><Clock className="w-3 h-3" /> Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-900 text-2xl">{inv.currency || 'USD'} {(inv.totalAmount || 0).toFixed(2)}</p>
                    {inv.amountPaid > 0 && (
                      <p className="text-xs text-emerald-600 font-bold mt-0.5">Paid: {inv.currency} {inv.amountPaid.toFixed(2)}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-bold ${sCfg.color} shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full ${sCfg.dot} animate-pulse`} />
                    {inv.status}
                  </div>
                  {inv.status !== 'Paid' && inv.status !== 'Draft' ? (
                    <button
                      onClick={e => { e.stopPropagation(); openPay(inv); }}
                      className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0"
                    >
                      <CreditCard className="w-4 h-4" /> Pay Now
                    </button>
                  ) : inv.status === 'Paid' ? (
                    <div className="flex items-center gap-1.5 px-4 py-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border-2 border-emerald-200 shrink-0 shadow-sm">
                      <BadgeCheck className="w-4 h-4" /> Settled
                    </div>
                  ) : null}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-primary-600" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-primary-600" />}
                </div>

                {isExpanded && (
                  <div className="border-t-2 border-slate-100 bg-slate-50 px-6 py-6 space-y-6">
                    <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 shadow-sm ${tCfg.bg} ${tCfg.border}`}>
                      <TypeIcon className={`w-6 h-6 ${tCfg.text} shrink-0`} />
                      <div>
                        <p className={`text-sm font-bold ${tCfg.text}`}>
                          This invoice is for: {tCfg.label}
                        </p>
                        <p className={`text-xs font-medium mt-0.5 opacity-80 ${tCfg.text}`}>
                          {invType === 'Ticket' && 'Covers your flight ticket booking with EliteTravel.'}
                          {invType === 'Visa'   && 'Covers your visa application processing fee.'}
                          {invType === 'Tour'   && 'Covers your tour package booking.'}
                          {invType === 'Cargo'  && 'Covers your cargo / freight shipment.'}
                          {(invType === 'General' || invType === 'Mixed') && 'General service invoice from EliteTravel.'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Invoice Breakdown
                      </p>
                      <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-100">
                              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                              <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                              <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(inv.items || []).map((item, i) => {
                              const iCfg = itemTypeConfig[item.linkedItemType] || null;
                              const IIcon = iCfg?.icon || FileText;
                              return (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-5 py-4">
                                    {iCfg ? (
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${iCfg.bg} ${iCfg.color} border border-current/20`}>
                                        <IIcon className="w-3 h-3" />
                                        {iCfg.label}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        <FileText className="w-3 h-3" />
                                        General
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 font-medium text-slate-700">{item.description}</td>
                                  <td className="px-5 py-4 text-right font-bold text-slate-900">{inv.currency} {(item.amount || 0).toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="border-t-4 border-slate-100">
                            <tr className="bg-slate-50">
                              <td colSpan={2} className="px-5 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Total</td>
                              <td className="px-5 py-4 text-right font-black text-slate-900 text-lg">{inv.currency} {(inv.totalAmount || 0).toFixed(2)}</td>
                            </tr>
                            {inv.amountPaid > 0 && (
                              <tr className="bg-emerald-50/50 border-t border-slate-100">
                                <td colSpan={2} className="px-5 py-3 text-sm text-emerald-600 font-bold">Amount Paid</td>
                                <td className="px-5 py-3 text-right text-sm font-black text-emerald-600">- {inv.currency} {inv.amountPaid.toFixed(2)}</td>
                              </tr>
                            )}
                            {outstanding > 0 && (
                              <tr className="bg-red-50 border-t-2 border-red-100">
                                <td colSpan={2} className="px-5 py-4 text-sm text-red-600 font-black uppercase tracking-wider">Balance Due</td>
                                <td className="px-5 py-4 text-right text-lg font-black text-red-600">{inv.currency} {outstanding.toFixed(2)}</td>
                              </tr>
                            )}
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {outstanding > 0 && inv.status !== 'Draft' && (
                      <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-2xl p-6 shadow-inner">
                        <div>
                          <p className="font-black text-slate-900 text-lg">Balance Due: <span className="text-red-600">{inv.currency} {outstanding.toFixed(2)}</span></p>
                          <p className="text-sm text-slate-600 font-medium mt-1">Pay now to settle your invoice instantly</p>
                        </div>
                        <button
                          onClick={() => openPay(inv)}
                          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:-translate-y-0.5"
                        >
                          Pay Now <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ Payment Modal ════════════════════════════════════════════════════════ */}
      {payInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[95vh] flex flex-col">
            
            {successReceipt ? (
              successReceipt.status === 'Pending' ? (
                /* ── WAITING FOR PIN AUTHORIZATION ── */
                <div className="p-0">
                  <div className="bg-primary-600 text-white p-5 flex items-center justify-between rounded-t-3xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-primary-200 uppercase">Mobile Money Payment</p>
                        <h3 className="text-xl font-black">{selectedProvider?.label || 'EVC Plus'}</h3>
                      </div>
                    </div>
                    <button onClick={closePay} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Wallet Phone Number <span className="text-red-500">*</span></label>
                      <div className="flex items-center border-2 border-emerald-400 bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-slate-50 text-slate-500 font-medium text-sm border-r border-slate-200">
                          SO
                        </div>
                        <input disabled type="text" value={payerAccountNo}
                          className="flex-1 px-4 py-3 text-slate-900 font-bold text-sm bg-transparent outline-none"
                        />
                        <div className="px-4">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Somali number starting with <strong className="text-slate-600">252</strong></p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-600 font-black tracking-widest uppercase text-xs mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Waiting for PIN Authorization
                      </div>
                      <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                        📱 Please pick up your phone now — check your screen and enter your mobile wallet PIN to authorize the payment. Keep this window open until confirmed.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-8 flex flex-col items-center text-center shadow-inner mb-6">
                      <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                        <Smartphone className="w-6 h-6 text-primary-600" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800">Awaiting PIN Entry</h4>
                      <p className="text-sm text-slate-400 font-medium mt-1">Prompt sent to <strong className="text-slate-700">{payerAccountNo}</strong></p>
                      <p className="text-sm text-slate-400 font-medium">Amount: <strong className="text-primary-600">${Number(payAmount).toFixed(2)}</strong></p>
                    </div>

                    <div className="flex gap-3">
                      <button disabled className="flex-1 py-3.5 bg-slate-100 text-slate-400 font-bold rounded-xl opacity-60">Cancel</button>
                      <button disabled className="flex-1 py-3.5 bg-primary-500 text-white font-bold rounded-xl opacity-80 flex items-center justify-center gap-2 shadow-md">
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                      </button>
                    </div>
                  </div>
                </div>
              ) : successReceipt.status === 'Failed' ? (
                /* ── Failed ── */
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-red-100 shadow-inner">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Payment Failed</h3>
                  <p className="text-slate-500 font-medium mb-8">Your transaction could not be completed. You may have cancelled the prompt or entered an incorrect PIN.</p>
                  <button onClick={closePay} className="w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition-all shadow-md">
                    Try Again
                  </button>
                </div>
              ) : (
              /* ── Success ── */
              <div className="p-8 text-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-emerald-100 shadow-inner">
                  <BadgeCheck className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Payment Successful!</h3>
                <p className="text-slate-500 font-medium mb-8">Your payment has been recorded.</p>
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 text-left space-y-4 mb-8">
                  {[
                    { label: 'Receipt #',   value: successReceipt.receiptNumber },
                    { label: 'Invoice',     value: payInvoice.invoiceNumber },
                    { label: 'Amount Paid', value: `${successReceipt.currency} ${Number(successReceipt.amountPaid).toFixed(2)}` },
                    { label: 'Method',      value: selectedProvider?.label || 'Mobile Money' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-500 font-semibold">{label}</span>
                      <span className="font-black text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={closePay} className="w-full py-4 bg-primary-600 text-white font-bold text-lg rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg">
                  Done
                </button>
              </div>
              )
            ) : payStep === 1 ? (
              /* ── Step 1: MAKE PAYMENT Header & Method Selection ── */
              <div className="p-0">
                <div className="bg-primary-600 text-white p-6 relative rounded-t-3xl shadow-sm">
                  <p className="text-[11px] font-bold tracking-widest text-primary-200 uppercase mb-1">Make Payment</p>
                  <h3 className="text-2xl font-black">{payInvoice.invoiceNumber}</h3>
                  <p className="text-sm font-medium mt-1 text-primary-100">Balance: ${Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)).toFixed(0)}</p>
                  <button onClick={closePay} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-2xl mb-6 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700">Total: <strong className="text-slate-900">${(payInvoice.totalAmount||0).toFixed(0)}</strong></p>
                      <p className="text-sm font-bold text-slate-700">Paid: <strong className="text-emerald-500">${(payInvoice.amountPaid||0).toFixed(0)}</strong></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance Due</p>
                      <p className="text-3xl font-black text-red-600">${Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)).toFixed(0)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Amount <span className="text-red-500">*</span></label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                        <input required type="number" min="0.01" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3.5 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white"
                        />
                      </div>
                      <button onClick={() => setPayAmount(Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)))} className="px-6 bg-white text-primary-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors">
                        Full ${Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)).toFixed(0)}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Method <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {paymentProviders.map(provider => {
                        const Icon = provider.icon;
                        return (
                          <button key={provider.id} onClick={() => handleProviderSelect(provider)}
                            className="relative flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all group bg-white"
                          >
                            {provider.isFast && (
                              <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white p-0.5 rounded-full shadow-sm">
                                <Zap className="w-2.5 h-2.5 fill-current" />
                              </div>
                            )}
                            <Icon className={`w-6 h-6 mb-2 text-slate-400 group-hover:text-blue-500`} />
                            <span className="text-xs font-bold text-slate-700">{provider.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {payError && <div className="mb-4 text-sm font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{payError}</div>}

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Note (Optional)</label>
                    <textarea value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Transaction ID or reference..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white resize-none h-20"
                    />
                  </div>
                </div>
              </div>
            ) : payStep === 2 ? (
              /* ── Step 2: EVC Plus Details ── */
              <div className="p-0">
                <div className="bg-primary-600 text-white p-5 flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPayStep(1)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                      <Smartphone className="w-5 h-5 text-white" />
                    </button>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-primary-200 uppercase">Mobile Money Payment</p>
                      <h3 className="text-xl font-black">{selectedProvider.label}</h3>
                    </div>
                  </div>
                  <button onClick={closePay} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Invoice Header */}
                  <div className="border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Invoice</p>
                      <p className="text-sm font-bold text-slate-900">{payInvoice.invoiceNumber}</p>
                    </div>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                        <p className="text-base font-bold text-slate-800">${(payInvoice.totalAmount||0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Already Paid</p>
                        <p className="text-base font-bold text-emerald-600">${(payInvoice.amountPaid||0).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Balance Due</p>
                        <p className="text-base font-bold text-red-600">${Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((payInvoice.amountPaid||0)/(payInvoice.totalAmount||1))*100)}%` }}></div>
                    </div>
                  </div>

                  <form onSubmit={handlePay}>
                    {paying && selectedProvider?.type === 'Mobile Money' ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                          <div className="relative bg-emerald-100 p-4 rounded-full border border-emerald-200">
                            <Smartphone className="w-12 h-12 text-emerald-600 animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Awaiting PIN...</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
                          📱 Please check your phone screen and enter your mobile wallet PIN to authorize the payment. 
                          <br/><br/>
                          <strong className="text-emerald-600">Keep this window open.</strong>
                        </p>
                        <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                          Waiting for secure confirmation...
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Amount to Pay <span className="text-red-500">*</span></label>
                            <span className="text-xs font-bold text-red-600">Max: ${Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)).toFixed(2)}</span>
                          </div>
                          <div className="relative mb-3">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-lg">$</span>
                            <input required type="number" min="0.01" max={Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)).toFixed(2)} step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                              className="w-full pl-8 pr-12 py-3.5 border-2 border-emerald-400 rounded-xl text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 bg-white shadow-sm"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {[
                              { label: 'Full', value: Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)) },
                              { label: 'Half', value: Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)) / 2 },
                              { label: '¼', value: Math.max(0, (payInvoice.totalAmount||0)-(payInvoice.amountPaid||0)) / 4 },
                            ].map((btn) => (
                              <button key={btn.label} type="button" onClick={() => setPayAmount(btn.value)}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg border ${Number(payAmount) === btn.value ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                              >
                                {btn.label} ${btn.value.toFixed(2)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white border border-blue-100 rounded-xl p-4 mb-6">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">After This Payment</p>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-500 font-medium">Total paid</span>
                            <span className="font-bold text-emerald-600">${((payInvoice.amountPaid||0) + Number(payAmount)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-slate-500 font-medium">Remaining balance</span>
                            {((payInvoice.amountPaid||0) + Number(payAmount)) >= (payInvoice.totalAmount||0) ? (
                              <span className="font-bold text-emerald-600 flex items-center gap-1">Fully Paid <CheckCircle className="w-4 h-4" /></span>
                            ) : (
                              <span className="font-bold text-amber-600">${(payInvoice.totalAmount - ((payInvoice.amountPaid||0) + Number(payAmount))).toFixed(2)}</span>
                            )}
                          </div>
                          <div className="w-full bg-blue-200/50 rounded-full h-1.5 mb-1">
                            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (((payInvoice.amountPaid||0) + Number(payAmount))/(payInvoice.totalAmount||1))*100)}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-blue-400">
                            <span>{Math.round((((payInvoice.amountPaid||0) + Number(payAmount))/(payInvoice.totalAmount||1))*100)}% paid</span>
                            <span>${(payInvoice.totalAmount||0).toFixed(2)} total</span>
                          </div>
                        </div>

                        <div className="border border-blue-100 bg-white rounded-xl p-4 flex items-center gap-4 mb-6">
                          <div className="w-8 h-8 rounded-md bg-white border border-blue-100 flex items-center justify-center">
                            <selectedProvider.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-blue-800">{selectedProvider.label}</p>
                            <p className="text-[11px] font-medium text-slate-500">{selectedProvider.desc}</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Wallet Phone Number <span className="text-red-500">*</span></label>
                          <div className="flex items-center border border-slate-300 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-xl overflow-hidden bg-white transition-all">
                            <div className="px-4 py-3.5 bg-white text-slate-400 font-medium text-sm border-r border-slate-200 uppercase">
                              SO +252
                            </div>
                            <input required type="tel" value={payerAccountNo}
                              onChange={e => {
                                // Strip all spaces, dashes, and non-digit characters on the fly
                                const clean = e.target.value.replace(/[^\d]/g, '');
                                setPayerAccountNo(clean);
                              }}
                              placeholder="615123456"
                              maxLength={12}
                              className="flex-1 px-4 py-3.5 text-slate-900 font-bold text-base bg-transparent outline-none"
                            />
                            {payerAccountNo.length > 8 && (
                              <div className="px-4">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-2">Somali number starting with <strong className="text-slate-600">252</strong> (e.g. 252615123456)</p>
                        </div>

                        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex gap-3 mb-6">
                          <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0" />
                          <p className="text-xs font-medium text-primary-800 leading-relaxed">
                            <strong className="font-bold">Secure payment.</strong> Your credentials are processed directly by <strong className="font-bold text-primary-700">WaafiPay</strong>. We never store your PIN.
                          </p>
                        </div>

                        {payError && (
                          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-red-600 text-sm font-bold flex items-center gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" /> {payError}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button type="button" onClick={() => setPayStep(1)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors">
                            Cancel
                          </button>
                          <button type="submit" disabled={paying}
                            className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {paying ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <>🔒 Pay ${(Number(payAmount)||0).toFixed(2)}</>}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            ) : payStep === 3 ? (
              /* ── Step 3: Stripe Credit Card Checkout ── */
              <div className="p-0">
                <div className="bg-primary-600 text-white p-5 flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPayStep(1)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                      <CreditCard className="w-5 h-5 text-white" />
                    </button>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-primary-200 uppercase">Card Payment</p>
                      <h3 className="text-xl font-black">Stripe Checkout</h3>
                    </div>
                  </div>
                  <button onClick={closePay} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="p-6">
                  {stripeLoading || !clientSecret ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-400" />
                      <p className="font-medium text-sm">Initializing secure payment...</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl">
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm 
                          invoice={payInvoice} 
                          amount={payAmount} 
                          onSuccess={(receipt) => {
                            setSuccessReceipt(receipt);
                            setClientSecret('');
                            load(); // refresh invoices
                          }} 
                          onCancel={() => setPayStep(1)} 
                        />
                      </Elements>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
