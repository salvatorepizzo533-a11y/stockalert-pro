
import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Send,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [webhookUrl, setWebhookUrl] = useState(settings.discord.webhookUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saved, setSaved] = useState(false);

  const handleTestWebhook = async () => {
    if (!webhookUrl) return;

    setTestStatus('testing');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [{
            title: 'Stock Monitor - Test Notification',
            description: 'Your Discord webhook is configured correctly!',
            color: 0x9D80FE,
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Stock Monitor Pro'
            }
          }]
        })
      });

      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      setTestStatus('error');
    }

    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const handleSave = () => {
    updateSettings({
      discord: {
        ...settings.discord,
        webhookUrl
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

  const toggleMentionEveryone = () => {
    updateSettings({
      discord: { ...settings.discord, mentionEveryone: !settings.discord.mentionEveryone }
    });
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const updateCheckInterval = (value: number) => {
    updateSettings({ checkIntervalDefault: Math.max(10, value) });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500">Configure your Discord notifications and monitor preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-accent-purple text-white px-6 py-2.5 rounded-xl text-xs font-bold glow-purple flex items-center gap-2"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Discord Settings */}
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#5865F2]/10 rounded-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Discord Integration</h2>
            <p className="text-xs text-slate-500">Configure your Discord webhook for stock alerts</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Webhook URL</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 transition-all"
              />
              <button
                onClick={handleTestWebhook}
                disabled={!webhookUrl || testStatus === 'testing'}
                className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  testStatus === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                  testStatus === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  'bg-[#121118] border border-white/5 hover:bg-white/5'
                } disabled:opacity-50`}
              >
                {testStatus === 'testing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
                    Testing...
                  </>
                ) : testStatus === 'success' ? (
                  <>
                    <CheckCircle size={14} />
                    Success!
                  </>
                ) : testStatus === 'error' ? (
                  <>
                    <AlertCircle size={14} />
                    Failed
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Test Webhook
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Get your webhook URL from Discord: Server Settings → Integrations → Webhooks → New Webhook
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#121118] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Bell size={18} className="accent-purple" />
              <div>
                <p className="text-sm font-medium">Enable Notifications</p>
                <p className="text-[10px] text-slate-500">Send alerts when products become available</p>
              </div>
            </div>
            <button
              onClick={toggleDiscordEnabled}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.discord.enabled ? 'bg-accent-purple' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.discord.enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#121118] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-lg">@everyone</span>
              <div>
                <p className="text-sm font-medium">Mention Everyone</p>
                <p className="text-[10px] text-slate-500">Add @everyone mention to alerts</p>
              </div>
            </div>
            <button
              onClick={toggleMentionEveryone}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.discord.mentionEveryone ? 'bg-accent-purple' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.discord.mentionEveryone ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Monitor Settings */}
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-accent-purple/10 rounded-xl">
            <Settings size={20} className="accent-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Monitor Settings</h2>
            <p className="text-xs text-slate-500">Configure default monitor behavior</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Default Check Interval (seconds)</label>
            <input
              type="number"
              value={settings.checkIntervalDefault}
              onChange={(e) => updateCheckInterval(parseInt(e.target.value) || 30)}
              min={10}
              max={300}
              className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50 transition-all"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              Minimum: 10 seconds. Higher intervals are recommended to avoid rate limiting.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#121118] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 size={18} className="accent-purple" /> : <VolumeX size={18} className="text-slate-500" />}
              <div>
                <p className="text-sm font-medium">Sound Notifications</p>
                <p className="text-[10px] text-slate-500">Play a sound when products are found</p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.soundEnabled ? 'bg-accent-purple' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
