import { useState, useCallback, useEffect } from 'react';
import { 
  Copy, 
  RefreshCw, 
  Check, 
  Shield, 
  History as HistoryIcon, 
  Lock, 
  Hash, 
  Type, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Strength = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';

interface PasswordEntry {
  id: string;
  value: string;
  timestamp: number;
}

export default function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PasswordEntry[]>([]);
  const [isRotating, setIsRotating] = useState(false);

  const generatePassword = useCallback(() => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let availableChars = '';
    if (options.uppercase) availableChars += charset.uppercase;
    if (options.lowercase) availableChars += charset.lowercase;
    if (options.numbers) availableChars += charset.numbers;
    if (options.symbols) availableChars += charset.symbols;

    if (!availableChars) return '';

    let generated = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      generated += availableChars[array[i] % availableChars.length];
    }

    return generated;
  }, [length, options]);

  const handleGenerate = () => {
    setIsRotating(true);
    const newPass = generatePassword();
    if (newPass) {
      setPassword(newPass);
      setHistory(prev => [{
        id: crypto.randomUUID(),
        value: newPass,
        timestamp: Date.now()
      }, ...prev].slice(0, 5));
    }
    setTimeout(() => setIsRotating(false), 500);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStrength = (pass: string): Strength => {
    if (!pass) return 'very-weak';
    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return 'very-weak';
    if (score === 2) return 'weak';
    if (score === 3) return 'fair';
    if (score === 4) return 'strong';
    return 'very-strong';
  };

  const strength = getStrength(password);
  const strengthConfig: Record<Strength, { label: string; color: string; width: string }> = {
    'very-weak': { label: 'Insecure', color: 'bg-red-500', width: '20%' },
    'weak': { label: 'Weak', color: 'bg-orange-500', width: '40%' },
    'fair': { label: 'Medium', color: 'bg-yellow-500', width: '60%' },
    'strong': { label: 'Strong', color: 'bg-emerald-500', width: '80%' },
    'very-strong': { label: 'Ultra', color: 'bg-cyan-500', width: '100%' },
  };

  useEffect(() => {
    handleGenerate();
  }, [options, length]); // Re-generate when core settings change for live feel

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 flex flex-col items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white mb-4 shadow-xl shadow-black/10">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 italic">VaultCraft</h1>
          <p className="text-neutral-500 font-medium text-sm tracking-wide uppercase">Secure Password Engine</p>
        </div>

        {/* Password Display */}
        <div className="glass-card p-6 space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="text"
              readOnly
              value={password}
              className="w-full pl-12 pr-24 py-4 bg-neutral-100 border-none rounded-xl text-xl font-mono text-neutral-800 focus:ring-2 focus:ring-black transition-all"
            />
            <div className="absolute inset-y-0 right-1 space-x-1 flex items-center p-1">
              <button
                onClick={handleGenerate}
                className="p-3 text-neutral-500 hover:text-black hover:bg-white rounded-lg transition-colors"
                title="Regenerate"
              >
                <motion.div animate={isRotating ? { rotate: 180 } : { rotate: 0 }}>
                  <RefreshCw className="w-5 h-5" />
                </motion.div>
              </button>
              <button
                onClick={() => handleCopy(password)}
                className="p-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center space-x-2"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-neutral-400">
              <span>Security Level</span>
              <span className={`transition-colors ${strengthConfig[strength].color.replace('bg-', 'text-')}`}>
                {strengthConfig[strength].label}
              </span>
            </div>
            <div className="strength-bar">
              <motion.div
                initial={false}
                animate={{ width: strengthConfig[strength].width }}
                className={`h-full transition-all duration-500 ${strengthConfig[strength].color}`}
              />
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="glass-card p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-neutral-700">Length</label>
              <span className="text-2xl font-mono font-medium text-black">{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(options) as Array<keyof typeof options>).map((key) => (
              <button
                key={key}
                onClick={() => setOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  options[key] 
                    ? 'border-black bg-black text-white shadow-lg shadow-black/10' 
                    : 'border-neutral-100 bg-neutral-50 text-neutral-500 hover:border-neutral-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {key === 'uppercase' && <Type className="w-4 h-4" />}
                  {key === 'lowercase' && <ChevronRight className="w-4 h-4 rotate-90" />}
                  {key === 'numbers' && <Hash className="w-4 h-4" />}
                  {key === 'symbols' && <Zap className="w-4 h-4" />}
                  <span className="text-sm font-semibold capitalize">{key}</span>
                </div>
                {options[key] && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Recent History */}
        <AnimatePresence>
          {history.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center space-x-2 mb-4 text-neutral-400 uppercase text-[10px] font-bold tracking-widest">
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>Recent Generations</span>
              </div>
              <div className="space-y-3">
                {history.slice(1).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between group">
                    <span className="font-mono text-sm text-neutral-500 truncate mr-4">
                      {entry.value}
                    </span>
                    <button 
                      onClick={() => handleCopy(entry.value)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-black"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center text-neutral-400 text-xs font-medium space-x-4">
          <span>Client-side generation</span>
          <span>&bull;</span>
          <span>Crypto API</span>
        </footer>
      </motion.div>
    </div>
  );
}
