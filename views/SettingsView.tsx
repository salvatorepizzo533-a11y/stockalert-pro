import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Send,
  CheckCircle,
  AlertCircle,
  Save,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [webhookRestock, setWebhookRestock] = useState(settings.discord.webhookRestock || '');
  const [webhookCheckout, setWebhookCheckout] = useState(settings.discord.webhookCheckout || '');
  const [webhookDecline, setWebhookDecline] = useState(settings.discord.webhookDecline || '');
  const [capsolverApiKey, setCapsolverApiKey] = useState(settings.captcha?.capsolverApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saved, setSaved] = useState(false);

  const handleTestWebhook = async (webhook: string) => {
    if (!webhook) return;
    setTestStatus('testing');
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'StockAlert Pro - Test',
            description: 'Webhook configured correctly!',
            color: 0x9D80FE,
            timestamp: new Date().toISOString()
          }]
        })
      });
      setTestStatus(response.ok ? 'success' : 'error');
    } catch {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const handleSave = () => {
    updateSettings({
      discord: {
        ...settings.discord,
        webhookRestock,
        webhookCheckout,
        webhookDecline
      },
      captcha: {
        ...settings.captcha,
        capsolverApiKey
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleDiscordEnabled = () => {
    updateSettings({
      discord: { ...settings.discord, enabled: !settings.discord.enabled }
    });
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-slate-500">Configure webhooks and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-accent-purple text-white px-5 py-2 rounded-xl text-xs font-bold glow-purple flex items-center gap-2"
        >
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Discord Webhooks */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#5865F2]/10 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <h2 className="text-sm font-bold">Discord Webhooks</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-green-400">Restock Webhook</label>
              <input
                type="url"
                value={webhookRestock}
                onChange={(e) => setWebhookRestock(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-[#0a090e] border border-white/10 rounded-lg py-2 px-3 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-blue-400">Checkout Webhook</label>
              <input
                type="url"
                value={webhookCheckout}
                onChange={(e) => setWebhookCheckout(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-[#0a090e] border border-white/10 rounded-lg py-2 px-3 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-red-400">Decline Webhook</label>
              <input
                type="url"
                value={webhookDecline}
                onChange={(e) => setWebhookDecline(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-[#0a090e] border border-white/10 rounded-lg py-2 px-3 text-xs"
              />
            </div>
            <button
              onClick={() => handleTestWebhook(webhookRestock || webhookCheckout || webhookDecline)}
              disabled={(!webhookRestock && !webhookCheckout && !webhookDecline) || testStatus === 'testing'}
              className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${
                testStatus === 'success' ? 'bg-green-500/10 text-green-400' :
                testStatus === 'error' ? 'bg-red-500/10 text-red-400' :
                'bg-[#0a090e] hover:bg-white/5'
              } disabled:opacity-50`}
            >
              {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Success!' : testStatus === 'error' ? 'Failed' : 'Test Webhooks'}
            </button>
          </div>
        </div>

        {/* Capsolver */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-accent-purple/10 rounded-lg">
              <ShieldCheck size={16} className="accent-purple" />
            </div>
            <h2 className="text-sm font-bold">Capsolver</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={capsolverApiKey}
                  onChange={(e) => setCapsolverApiKey(e.target.value)}
                  placeholder="CAP-XXXXXXXX"
                  className="w-full bg-[#0a090e] border border-white/10 rounded-lg py-2 px-3 pr-10 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">From capsolver.com</p>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#0a090e] rounded-lg">
              <span className="text-xs">Enable Notifications</span>
              <button
                onClick={toggleDiscordEnabled}
                className={`w-10 h-5 rounded-full transition-all ${settings.discord.enabled ? 'bg-accent-purple' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.discord.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#0a090e] rounded-lg">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 size={14} className="accent-purple" /> : <VolumeX size={14} className="text-slate-500" />}
                <span className="text-xs">Sound</span>
              </div>
              <button
                onClick={toggleSound}
                className={`w-10 h-5 rounded-full transition-all ${settings.soundEnabled ? 'bg-accent-purple' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
