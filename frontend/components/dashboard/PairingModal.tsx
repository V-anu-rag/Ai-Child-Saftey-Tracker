import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Check, Copy, UserPlus, QrCode as QrIcon, Hash } from "lucide-react";
import { Button } from "@/components/common/Button";
import { childrenAPI } from "@/lib/api";

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PairingModal({ isOpen, onClose }: PairingModalProps) {
  const [step, setStep] = useState(1); // 1: Form, 2: Code
  const [showQR, setShowQR] = useState(false);
  const [childData, setChildData] = useState({ name: "", age: "" });
  const [pairingCode, setPairingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await childrenAPI.add({
        name: childData.name,
        age: parseInt(childData.age),
      }) as any;
      
      setPairingCode(res.child.pairingCode);
      setStep(2);
    } catch (err) {
      alert("Failed to generate code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-app-jet/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-app-jet">
                {step === 1 ? "Add Your Child" : "Pair Device"}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-app-bg rounded-xl transition-colors">
                <X className="w-5 h-5 text-app-jet/50" />
              </button>
            </div>

            {step === 1 ? (
              <form onSubmit={handleCreateChild} className="space-y-4">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-app-red/10 flex items-center justify-center mb-4">
                    <UserPlus className="w-8 h-8 text-app-red" />
                  </div>
                  <p className="text-sm text-app-jet/60">
                    First, create a profile for your child to generate a unique pairing code.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-app-jet/60 ml-1">Child&apos;s Name</label>
                  <input
                    required
                    className="w-full bg-app-bg border border-app-green/30 rounded-xl px-4 py-3 text-app-jet focus:ring-2 focus:ring-app-red/20 outline-none"
                    placeholder="e.g. Leo"
                    value={childData.name}
                    onChange={(e) => setChildData({ ...childData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-app-jet/60 ml-1">Age</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="18"
                    className="w-full bg-app-bg border border-app-green/30 rounded-xl px-4 py-3 text-app-jet focus:ring-2 focus:ring-app-red/20 outline-none"
                    placeholder="e.g. 10"
                    value={childData.age}
                    onChange={(e) => setChildData({ ...childData, age: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                  Generate Pairing Code
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-app-red/10 flex items-center justify-center mb-4">
                    <Smartphone className="w-8 h-8 text-app-red" />
                  </div>
                  <p className="text-sm text-app-jet/60 leading-relaxed px-4">
                    Open the **SafeTrack Child** app and scan this QR or enter the code.
                  </p>
                </div>

                <div className="bg-app-bg border-2 border-dashed border-app-green/50 rounded-3xl p-8 flex flex-col items-center gap-6 min-h-[300px] justify-center">
                  {showQR ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white p-4 rounded-2xl shadow-inner border border-app-green/10"
                    >
                      {/* Using Google QR API - No Library Needed */}
                      <img 
                        src={`https://chart.googleapis.com/chart?cht=qr&chl=${pairingCode}&chs=200x200&chld=M|0`} 
                        alt="Pairing QR Code"
                        className="w-[180px] h-[180px]"
                      />
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-xs font-bold text-app-jet/40 uppercase tracking-widest">Pairing Code</span>
                      <div className="text-4xl font-black text-app-jet tracking-[0.2em] font-mono">
                        {pairingCode}
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm font-semibold text-app-red hover:text-app-salmon transition-colors"
                      >
                        {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-app-green/20 text-xs font-bold text-app-jet/60 hover:bg-app-bg transition-all"
                  >
                    {showQR ? <><Hash className="w-3.5 h-3.5" /> Show Code</> : <><QrIcon className="w-3.5 h-3.5" /> Show QR Code</>}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-app-green/20 flex items-center justify-center text-[10px] font-bold text-app-jet mt-0.5">1</div>
                    <p className="text-xs text-app-jet/70">Open the app on the child&apos;s device.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-app-green/20 flex items-center justify-center text-[10px] font-bold text-app-jet mt-0.5">2</div>
                    <p className="text-xs text-app-jet/70">Select &quot;Child&quot; and scan the QR or enter the code.</p>
                  </div>
                </div>

                <Button onClick={onClose} className="w-full" size="lg">
                  Done
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
