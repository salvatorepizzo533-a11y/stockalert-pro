import React, { useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const CaptchasView: React.FC = () => {
  const { settings, updateSettings, captchaStats, updateCaptchaStats } = useApp();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  // Ensure captcha settings exist
  const captchaSettings = settings.captcha || {
    capsolverEnabled: false,
    capsolverApiKey: '',
    autoSolveHCaptcha: true,
    autoSolveReCaptcha: true
  };

  const handleTestCapsolver = async () => {
    if (!captchaSettings.capsolverApiKey) return;

    setTesting(true);
    setTestResult('idle');

    try {
      // Test Capsolver API by checking balance
      const response = await fetch('https://api.capsolver.com/getBalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientKey: captchaSettings.capsolverApiKey
        })
      });

      const data = await response.json();

      if (data.errorId === 0) {
        updateCaptchaStats({
          balance: data.balance,
          lastUpdated: new Date().toISOString()
        });
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (error) {
      setTestResult('error');
    }

    setTesting(false);
    setTimeout(() => setTestResult('idle'), 3000);
  };

  const handleRefreshBalance = async () => {
    await handleTestCapsolver();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Captchas</h1>
          <p className="text-sm text-slate-500">Configure captcha solving for your tasks</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-green-500/10 rounded-xl">
              <DollarSign size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Balance</p>
              <p className="text-2xl font-bold">${captchaStats.balance.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={handleRefreshBalance}
            disabled={!captchaSettings.capsolverApiKey || testing}
            className="w-full py-2 rounded-xl bg-[#0a090e] border border-white/10 text-xs font-medium hover:bg-white/5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
            Refresh Balance
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Activity size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Solved Today</p>
              <p className="text-2xl font-bold">{captchaStats.solvedToday}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Total: {captchaStats.solvedTotal} captchas solved
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Zap size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className="text-2xl font-bold">
                {captchaSettings.capsolverEnabled ? (
                  <span className="text-green-400">Active</span>
                ) : (
                  <span className="text-slate-500">Disabled</span>
                )}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {captchaSettings.capsolverApiKey ? 'API Key configured' : 'No API Key'}
          </p>
        </div>
      </div>

      {/* Capsolver Configuration */}
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-accent-purple/10 rounded-xl">
            <ShieldCheck size={20} className="accent-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Capsolver Integration</h2>
            <p className="text-xs text-slate-500">Auto-solve hCaptcha and reCAPTCHA challenges</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#0a090e] rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="accent-purple" />
              <div>
                <p className="text-sm font-medium">Enable Capsolver</p>
                <p className="text-[10px] text-slate-500">Automatically solve captchas during checkout</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({
                captcha: { ...settings.captcha, capsolverEnabled: !captchaSettings.capsolverEnabled }
              })}
              className={`w-12 h-6 rounded-full transition-all ${
                captchaSettings.capsolverEnabled ? 'bg-accent-purple' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                captchaSettings.capsolverEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          {/* API Key Input - Note: This is configured in Settings */}
          <div className="p-4 bg-[#0a090e] rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">API Key Status</p>
              {testResult === 'success' && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle size={12} />
                  Connected
                </span>
              )}
              {testResult === 'error' && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} />
                  Invalid Key
                </span>
              )}
            </div>

            {captchaSettings.capsolverApiKey ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#121118] border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-slate-500">
                  {captchaSettings.capsolverApiKey.slice(0, 8)}...{captchaSettings.capsolverApiKey.slice(-4)}
                </div>
                <button
                  onClick={handleTestCapsolver}
                  disabled={testing}
                  className="px-4 py-3 rounded-xl bg-accent-purple text-xs font-bold disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Configure your Capsolver API Key in <span className="text-accent-purple">Settings</span>
              </p>
            )}
          </div>

          {/* Captcha Types */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-[#0a090e] rounded-xl border border-white/10">
              <div>
                <p className="text-sm font-medium">hCaptcha</p>
                <p className="text-[10px] text-slate-500">Used by Shopify stores</p>
              </div>
              <button
                onClick={() => updateSettings({
                  captcha: { ...settings.captcha, autoSolveHCaptcha: !captchaSettings.autoSolveHCaptcha }
                })}
                className={`w-12 h-6 rounded-full transition-all ${
                  captchaSettings.autoSolveHCaptcha ? 'bg-accent-purple' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  captchaSettings.autoSolveHCaptcha ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0a090e] rounded-xl border border-white/10">
              <div>
                <p className="text-sm font-medium">reCAPTCHA</p>
                <p className="text-[10px] text-slate-500">Google reCAPTCHA v2/v3</p>
              </div>
              <button
                onClick={() => updateSettings({
                  captcha: { ...settings.captcha, autoSolveReCaptcha: !captchaSettings.autoSolveReCaptcha }
                })}
                className={`w-12 h-6 rounded-full transition-all ${
                  captchaSettings.autoSolveReCaptcha ? 'bg-accent-purple' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  captchaSettings.autoSolveReCaptcha ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-500">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="text-sm text-slate-400 space-y-2">
          <li>1. Get your API key from <a href="https://capsolver.com" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline">capsolver.com</a></li>
          <li>2. Add your API key in Settings</li>
          <li>3. Enable Capsolver and the captcha types you want to auto-solve</li>
          <li>4. When a task encounters a captcha, it will be automatically solved</li>
        </ul>
      </div>
    </div>
  );
};

export default CaptchasView;
