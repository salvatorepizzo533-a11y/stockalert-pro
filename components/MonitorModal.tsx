
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Monitor } from '../types';

interface MonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; urls: string[]; keywords: string[]; negativeKeywords: string[]; checkInterval: number }) => void;
  editMonitor?: Monitor | null;
}

const MonitorModal: React.FC<MonitorModalProps> = ({ isOpen, onClose, onSave, editMonitor }) => {
  const [name, setName] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([]);
  const [checkInterval, setCheckInterval] = useState(30);

  useEffect(() => {
    if (editMonitor) {
      setName(editMonitor.name);
      setUrls(editMonitor.urls.length > 0 ? editMonitor.urls : ['']);
      setKeywords(editMonitor.keywords.length > 0 ? editMonitor.keywords : ['']);
      setNegativeKeywords(editMonitor.negativeKeywords);
      setCheckInterval(editMonitor.checkInterval);
    } else {
      setName('');
      setUrls(['']);
      setKeywords(['']);
      setNegativeKeywords([]);
      setCheckInterval(30);
    }
  }, [editMonitor, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;

    const validUrls = urls.filter(u => u.trim());
    const validKeywords = keywords.filter(k => k.trim());

    if (validUrls.length === 0) return;

    onSave({
      name: name.trim(),
      urls: validUrls,
      keywords: validKeywords,
      negativeKeywords: negativeKeywords.filter(k => k.trim()),
      checkInterval
    });
    onClose();
  };

  const addUrl = () => setUrls([...urls, '']);
  const removeUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addKeyword = () => setKeywords([...keywords, '']);
  const removeKeyword = (index: number) => setKeywords(keywords.filter((_, i) => i !== index));
  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const addNegativeKeyword = () => setNegativeKeywords([...negativeKeywords, '']);
  const removeNegativeKeyword = (index: number) => setNegativeKeywords(negativeKeywords.filter((_, i) => i !== index));
  const updateNegativeKeyword = (index: number, value: string) => {
    const newKeywords = [...negativeKeywords];
    newKeywords[index] = value;
    setNegativeKeywords(newKeywords);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B0A0F] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">{editMonitor ? 'Edit Monitor' : 'New Monitor'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Monitor Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Nike Dunks Monitor"
              className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
            />
          </div>

          {/* URLs */}
          <div>
            <label className="block text-sm font-medium mb-2">Product URLs</label>
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://store.com/products/..."
                    className="flex-1 bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                  />
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrl(index)}
                      className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addUrl}
              className="mt-2 flex items-center gap-2 text-xs text-accent-purple hover:text-white transition-colors"
            >
              <Plus size={14} /> Add URL
            </button>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium mb-2">Keywords (optional)</label>
            <p className="text-[10px] text-slate-500 mb-2">Only alert if product name contains these keywords</p>
            <div className="space-y-2">
              {keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    placeholder="e.g., dunk, jordan"
                    className="flex-1 bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                  />
                  {keywords.length > 1 && (
                    <button
                      onClick={() => removeKeyword(index)}
                      className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addKeyword}
              className="mt-2 flex items-center gap-2 text-xs text-accent-purple hover:text-white transition-colors"
            >
              <Plus size={14} /> Add Keyword
            </button>
          </div>

          {/* Negative Keywords */}
          <div>
            <label className="block text-sm font-medium mb-2">Negative Keywords (optional)</label>
            <p className="text-[10px] text-slate-500 mb-2">Exclude products containing these words</p>
            <div className="space-y-2">
              {negativeKeywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => updateNegativeKeyword(index, e.target.value)}
                    placeholder="e.g., kids, toddler"
                    className="flex-1 bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
                  />
                  <button
                    onClick={() => removeNegativeKeyword(index)}
                    className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addNegativeKeyword}
              className="mt-2 flex items-center gap-2 text-xs text-accent-purple hover:text-white transition-colors"
            >
              <Plus size={14} /> Add Negative Keyword
            </button>
          </div>

          {/* Check Interval */}
          <div>
            <label className="block text-sm font-medium mb-2">Check Interval (seconds)</label>
            <input
              type="number"
              value={checkInterval}
              onChange={(e) => setCheckInterval(Math.max(10, parseInt(e.target.value) || 30))}
              min={10}
              max={300}
              className="w-full bg-[#121118] border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-purple/50"
            />
            <p className="text-[10px] text-slate-500 mt-2">Minimum 10 seconds. Higher values reduce server load.</p>
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
            disabled={!name.trim() || urls.filter(u => u.trim()).length === 0}
            className="flex-1 py-3 rounded-xl bg-accent-purple text-white text-sm font-bold glow-purple hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editMonitor ? 'Save Changes' : 'Create Monitor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonitorModal;
