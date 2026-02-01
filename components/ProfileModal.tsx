
import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Profile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Omit<Profile, 'id'>) => void;
  editProfile?: Profile | null;
}

const COUNTRIES = [
  { code: 'IT', name: 'Italia' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() + i));

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, editProfile }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping address
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('IT');

  // Billing
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingAddress1, setBillingAddress1] = useState('');
  const [billingAddress2, setBillingAddress2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingProvince, setBillingProvince] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('IT');

  // Payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  useEffect(() => {
    if (editProfile) {
      setName(editProfile.name);
      setEmail(editProfile.email);
      setPhone(editProfile.phone);
      setFirstName(editProfile.shipping.firstName);
      setLastName(editProfile.shipping.lastName);
      setAddress1(editProfile.shipping.address1);
      setAddress2(editProfile.shipping.address2);
      setCity(editProfile.shipping.city);
      setProvince(editProfile.shipping.province);
      setZip(editProfile.shipping.zip);
      setCountry(editProfile.shipping.country);

      setBillingSameAsShipping(editProfile.billingSameAsShipping ?? true);
      if (editProfile.billing) {
        setBillingFirstName(editProfile.billing.firstName);
        setBillingLastName(editProfile.billing.lastName);
        setBillingAddress1(editProfile.billing.address1);
        setBillingAddress2(editProfile.billing.address2);
        setBillingCity(editProfile.billing.city);
        setBillingProvince(editProfile.billing.province);
        setBillingZip(editProfile.billing.zip);
        setBillingCountry(editProfile.billing.country);
      }

      if (editProfile.payment) {
        setCardNumber(formatCardNumber(editProfile.payment.cardNumber));
        setCardHolder(editProfile.payment.cardHolder);
        setExpiryMonth(editProfile.payment.expiryMonth);
        setExpiryYear(editProfile.payment.expiryYear);
        setCvv(editProfile.payment.cvv);
      }
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setFirstName('');
      setLastName('');
      setAddress1('');
      setAddress2('');
      setCity('');
      setProvince('');
      setZip('');
      setCountry('IT');
      setBillingSameAsShipping(true);
      setBillingFirstName('');
      setBillingLastName('');
      setBillingAddress1('');
      setBillingAddress2('');
      setBillingCity('');
      setBillingProvince('');
      setBillingZip('');
      setBillingCountry('IT');
      setCardNumber('');
      setCardHolder('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
    }
  }, [editProfile, isOpen]);

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !firstName.trim() || !lastName.trim()) return;

    const profileData: Omit<Profile, 'id'> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      shipping: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address1: address1.trim(),
        address2: address2.trim(),
        city: city.trim(),
        province: province.trim(),
        zip: zip.trim(),
        country
      },
      billingSameAsShipping,
      billing: billingSameAsShipping ? undefined : {
        firstName: billingFirstName.trim(),
        lastName: billingLastName.trim(),
        address1: billingAddress1.trim(),
        address2: billingAddress2.trim(),
        city: billingCity.trim(),
        province: billingProvince.trim(),
        zip: billingZip.trim(),
        country: billingCountry
      },
      payment: cardNumber.trim() ? {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder: cardHolder.trim(),
        expiryMonth,
        expiryYear,
        cvv
      } : undefined
    };

    onSave(profileData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B0A0F] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">{editProfile ? 'Edit Profile' : 'New Profile'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Home Address, Work Address"
              className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 123 456 7890"
                className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-white/5 pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Shipping Address</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Mario"
                  className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rossi"
                  className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Address Line 1</label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Via Roma 123"
                className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Address Line 2 (optional)</label>
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Apartment, suite, etc."
                className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Milano"
                  className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Province/State</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="MI"
                  className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="20100"
                  className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 h-[50px] appearance-none cursor-pointer"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Address Toggle */}
          <div className="border-t border-white/5 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Billing Address</h3>
              <button
                type="button"
                onClick={() => setBillingSameAsShipping(!billingSameAsShipping)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  billingSameAsShipping ? 'bg-accent-purple' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    billingSameAsShipping ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              {billingSameAsShipping
                ? 'Billing address is the same as shipping address'
                : 'Enter a different billing address below'}
            </p>

            {/* Billing Fields - shown only when different */}
            {!billingSameAsShipping && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={billingFirstName}
                      onChange={(e) => setBillingFirstName(e.target.value)}
                      placeholder="Mario"
                      className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={billingLastName}
                      onChange={(e) => setBillingLastName(e.target.value)}
                      placeholder="Rossi"
                      className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={billingAddress1}
                    onChange={(e) => setBillingAddress1(e.target.value)}
                    placeholder="Via Roma 123"
                    className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address Line 2 (optional)</label>
                  <input
                    type="text"
                    value={billingAddress2}
                    onChange={(e) => setBillingAddress2(e.target.value)}
                    placeholder="Apartment, suite, etc."
                    className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      placeholder="Milano"
                      className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Province/State</label>
                    <input
                      type="text"
                      value={billingProvince}
                      onChange={(e) => setBillingProvince(e.target.value)}
                      placeholder="MI"
                      className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={billingZip}
                      onChange={(e) => setBillingZip(e.target.value)}
                      placeholder="20100"
                      className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <select
                    value={billingCountry}
                    onChange={(e) => setBillingCountry(e.target.value)}
                    className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 h-[50px] appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="accent-purple" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Payment Method</h3>
              <span className="text-xs text-slate-600">(optional)</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="MARIO ROSSI"
                  className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Month</label>
                  <select
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 h-[50px] appearance-none cursor-pointer"
                  >
                    <option value="">MM</option>
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <select
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 h-[50px] appearance-none cursor-pointer"
                  >
                    <option value="">YYYY</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      if (v.length <= 4) setCvv(v);
                    }}
                    placeholder="***"
                    maxLength={4}
                    className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/5 text-sm font-bold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || !firstName.trim() || !lastName.trim()}
            className="flex-1 py-3 rounded-xl bg-accent-purple text-white text-sm font-bold glow-purple hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editProfile ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
