import { Fingerprint, Lock, ShieldAlert, Unlock } from "lucide-react";
import React, { useState } from "react";

interface MasterLockProps {
  onUnlock: () => void;
}

const MasterLock: React.FC<MasterLockProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would verify against a PBKDF2 hash
    // For this demo, let's pretend any non-empty password works
    // but typically you'd have the user set one on first run.
    if (password.length >= 4) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex p-4 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl relative">
            <Lock
              className={`w-10 h-10 text-indigo-500 transition-all duration-500 ${error ? "animate-bounce text-rose-500" : ""}`}
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
            Vault Locked
          </h1>
          <p className="text-zinc-500 text-sm max-w-[280px] mx-auto leading-relaxed">
            Please enter your master password to decrypt your secrets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input
              autoFocus
              type="password"
              placeholder="Enter Master Password"
              className={`w-full bg-zinc-900 border ${error ? "border-rose-500/50" : "border-zinc-800"} rounded-2xl px-5 py-4 text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:tracking-normal placeholder:text-sm`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="absolute -bottom-6 left-0 right-0 text-center animate-in fade-in slide-in-from-top-1">
                <p className="text-xs text-rose-500 font-semibold flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Password must be at least 4 characters
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Unlock className="w-5 h-5" />
            Unlock Vault
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-4">
          <button className="flex items-center gap-2 text-zinc-600 hover:text-zinc-400 text-xs font-medium transition-colors">
            <Fingerprint className="w-4 h-4" />
            Biometric Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterLock;
