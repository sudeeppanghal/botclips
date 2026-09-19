"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Wallet, 
  Copy, 
  Check, 
  ShieldCheck, 
  History, 
  ArrowDownLeft, 
  AlertCircle, 
  AlertTriangle,
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  ExternalLink,
  Coins,
  QrCode,
  Eye,
  X,
  Zap,
  Smartphone,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function WalletPage() {
  const [balance, setBalance] = useState(0.00);
  const [method, setMethod] = useState<"UPI" | "CRYPTO">("UPI");
  
  // UPI State
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [utr, setUtr] = useState("");

  // Crypto State
  const [cryptoNetwork, setCryptoNetwork] = useState<"TRC20" | "BEP20">("TRC20");
  const [cryptoUsdt, setCryptoUsdt] = useState(10);
  const [customCryptoUsdt, setCustomCryptoUsdt] = useState("");
  const [txHash, setTxHash] = useState("");
  const [onChainSuccess, setOnChainSuccess] = useState<string | null>(null);

  // Common UI State
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedCrypto, setCopiedCrypto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Screenshots state
  const [screenshot1, setScreenshot1] = useState<string | null>(null);
  const [screenshot2, setScreenshot2] = useState<string | null>(null);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState({
    siteName: "BotClips",
    upiId: "Jaatdhillon@fam",
    trc20Address: "TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz",
    bep20Address: "0x71C3Ba8921e10FdB89C40a12F8e312A7C3241410",
    minDeposit: 100,
    usdToInrRate: 96
  });

  const loadData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.authenticated && meData.user) {
        setBalance(Number(meData.user.balance || 0));
      }

      // Load public site settings (UPI, Crypto, min deposit)
      try {
        const settingsRes = await fetch("/api/settings");
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setSiteSettings(settingsData.settings);
        }
      } catch {}

      // Load both UPI and Crypto payments
      const [upiRes, cryptoRes] = await Promise.all([
        fetch("/api/billing/upi"),
        fetch("/api/billing/crypto")
      ]);

      const upiData = await upiRes.json();
      const cryptoData = await cryptoRes.json();

      let combined: any[] = [];

      if (upiData.success && Array.isArray(upiData.payments)) {
        combined = combined.concat(upiData.payments.map((p: any) => ({
          ...p,
          paymentType: "UPI",
          displayAmount: "₹" + p.amount,
        })));
      }

      if (cryptoData.success && Array.isArray(cryptoData.payments)) {
        combined = combined.concat(cryptoData.payments.map((p: any) => ({
          ...p,
          paymentType: "CRYPTO",
          displayAmount: p.amountUsdt + " USDT",
        })));
      }

      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(combined);
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const upiId = siteSettings.upiId || "Jaatdhillon@fam";
  const trc20 = siteSettings.trc20Address || "TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz";
  const bep20 = siteSettings.bep20Address || "0x71C3Ba8921e10FdB89C40a12F8e312A7C3241410";
  const minDeposit = Math.max(100, siteSettings.minDeposit || 100);
  const activeCryptoAddress = cryptoNetwork === "TRC20" ? trc20 : bep20;

  const rawUpiAmount = customAmount ? Number(customAmount) : amount;
  const activeUpiAmount = Math.max(100, Number(rawUpiAmount) || 100);
  const activeCryptoAmount = customCryptoUsdt ? Number(customCryptoUsdt) : cryptoUsdt;
  const activeCryptoInr = Math.round(activeCryptoAmount * (siteSettings.usdToInrRate || 96));

  const upiQrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" + encodeURIComponent("upi://pay?pa=" + upiId + "&pn=BotClips&am=" + activeUpiAmount + "&cu=INR");
  const upiQrFallback = "https://quickchart.io/qr?size=260&text=" + encodeURIComponent("upi://pay?pa=" + upiId + "&pn=BotClips&am=" + activeUpiAmount + "&cu=INR");

  const cryptoQrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" + encodeURIComponent(activeCryptoAddress);
  const cryptoQrFallback = "https://quickchart.io/qr?size=260&text=" + encodeURIComponent(activeCryptoAddress);

  const upiNote = encodeURIComponent(`BotClips Deposit ₹${activeUpiAmount}`);
  const payeeName = encodeURIComponent(siteSettings.siteName || "BotClips");
  const encodedUpiId = encodeURIComponent(upiId);
  const upiAmountFormatted = activeUpiAmount.toFixed(2);

  const genericUpiIntent = `upi://pay?pa=${encodedUpiId}&pn=${payeeName}&am=${upiAmountFormatted}&cu=INR&tn=${upiNote}`;
  const gpayIntent = `tez://upi/pay?pa=${encodedUpiId}&pn=${payeeName}&am=${upiAmountFormatted}&cu=INR&tn=${upiNote}`;
  const phonepeIntent = `phonepe://pay?pa=${encodedUpiId}&pn=${payeeName}&am=${upiAmountFormatted}&cu=INR&tn=${upiNote}`;
  const paytmIntent = `paytmmp://pay?pa=${encodedUpiId}&pn=${payeeName}&am=${upiAmountFormatted}&cu=INR&tn=${upiNote}`;
  const credIntent = `cred://upi/pay?pa=${encodedUpiId}&pn=${payeeName}&am=${upiAmountFormatted}&cu=INR&tn=${upiNote}`;

  const handleOpenUpiApp = (url: string) => {
    try {
      window.location.href = url;
    } catch {
      window.open(url, "_blank");
    }
  };

  const copyText = (txt: string, type: "upi" | "crypto") => {
    navigator.clipboard.writeText(txt);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedCrypto(true);
      setTimeout(() => setCopiedCrypto(false), 2000);
    }
  };

  // Client-side image compressor: shrinks 5-10MB mobile screenshots down to ~100KB in milliseconds
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/") || file.size < 200 * 1024) return file;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(compressed);
                } else {
                  resolve(file);
                }
              },
              "image/jpeg",
              0.8
            );
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Image Upload handler (Cloudinary endpoint with unsigned preset & compression)
  const handleFileUpload = async (rawFile: File, target: 1 | 2) => {
    if (!rawFile) return;

    if (target === 1) setUploading1(true);
    else setUploading2(true);
    setError(null);

    try {
      // Compress client-side first so upload is ultra-lightweight and instantaneous
      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image");
      }

      if (target === 1) setScreenshot1(data.url);
      else setScreenshot2(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image screenshot");
    } finally {
      if (target === 1) setUploading1(false);
      else setUploading2(false);
    }
  };

  // Handle UPI Deposit Submission
  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotification(null);

    const depositAmount = customAmount ? Number(customAmount) : amount;

    if (depositAmount < minDeposit) {
      setError(`Minimum deposit amount is strictly ₹${minDeposit} INR.`);
      return;
    }

    if (!utr || utr.trim().length < 8) {
      setError("Please enter a valid 12-digit UPI / UTR Transaction ID.");
      return;
    }

    if (!screenshot1 && !screenshot2) {
      setError("Please upload your payment verification screenshot (Receipt or Success Screen).");
      return;
    }

    const s1 = screenshot1 || screenshot2;
    const s2 = screenshot2 || screenshot1;

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: utr.trim(),
          amount: depositAmount,
          screenshot1: s1,
          screenshot2: s2,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit deposit proof.");
      }

      setNotification("UPI Deposit submitted! Admin will inspect the 2 screenshots and credit your balance within 2-5 minutes.");
      setUtr("");
      setScreenshot1(null);
      setScreenshot2(null);
      setCustomAmount("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Crypto USDT Submission
  const handleCryptoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotification(null);
    setOnChainSuccess(null);

    const depositUsdt = customCryptoUsdt ? Number(customCryptoUsdt) : cryptoUsdt;

    if (depositUsdt < 1) {
      setError("Minimum crypto deposit is strictly 1 USDT.");
      return;
    }

    if (!txHash || txHash.trim().length < 16) {
      setError("Please enter a valid blockchain Transaction Hash (TxID).");
      return;
    }

    if (!screenshot1 && !screenshot2) {
      setError("Please upload your payment verification screenshot (Withdrawal Receipt or Blockchain Confirmation).");
      return;
    }

    const s1 = screenshot1 || screenshot2;
    const s2 = screenshot2 || screenshot1;

    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
          amountUsdt: depositUsdt,
          screenshot1: s1,
          screenshot2: s2,
          network: cryptoNetwork,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit crypto deposit.");
      }

      if (data.onChainVerified) {
        setOnChainSuccess("Transaction verified on-chain via TronScan! Pending final manual admin approval.");
      }

      setNotification(data.message || "Crypto deposit submitted! Admin will verify proofs on TronScan and credit your balance.");
      setTxHash("");
      setScreenshot1(null);
      setScreenshot2(null);
      setCustomCryptoUsdt("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to submit crypto payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Zoom Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={previewImage} alt="Proof Fullscreen Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Header & Balance Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Wallet & Add Funds
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deposit funds with zero transaction fees via UPI QR or Crypto USDT TRC-20.
          </p>
        </div>

        <div className="bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Wallet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Current Available Balance</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">₹{balance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {onChainSuccess && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center gap-3 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600" />
          <span>{onChainSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Strict Policy & Ban Warning Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/30 text-xs font-semibold space-y-2">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>⚠️ Mandatory Deposit Policy & Security Warnings</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-slate-800 dark:text-slate-200">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-amber-500/20">
            <span className="text-rose-500 font-bold text-sm">❌</span>
            <div>
              <strong className="text-slate-900 dark:text-white font-bold block">Below ₹100 = Strictly Non-Refundable</strong>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                Minimum deposit is strictly <strong>₹{minDeposit} INR (or 1 USDT)</strong>. Any amount sent below ₹{minDeposit} will NOT be credited and cannot be refunded.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-rose-500/20">
            <span className="text-rose-500 font-bold text-sm">🚫</span>
            <div>
              <strong className="text-rose-600 dark:text-rose-400 font-bold block">Fake Screenshot = Instant Permanent Ban</strong>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                Uploading edited / forged screenshots or fake UTRs results in an <strong>immediate permanent IP & account ban</strong> with total wallet balance freeze.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Payment Box & Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deposit Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          {/* Method Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <button
              onClick={() => {
                setMethod("UPI");
                setScreenshot1(null);
                setScreenshot2(null);
                setError(null);
              }}
              className={"px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (
                method === "UPI"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              )}
            >
              UPI QR Code (Min ₹100)
            </button>
            <button
              onClick={() => {
                setMethod("CRYPTO");
                setScreenshot1(null);
                setScreenshot2(null);
                setError(null);
              }}
              className={"px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer " + (
                method === "CRYPTO"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              )}
            >
              USDT (TRC20 / BEP20)
            </button>
          </div>

          {method === "UPI" ? (
            <div className="space-y-4">
              {/* Preset buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Select Amount (Min ₹100)
                  </label>
                  <span className="text-[11px] text-blue-600 font-bold">100% Zero Fees</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[100, 200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount("");
                      }}
                      className={"py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer " + (
                        !customAmount && amount === amt
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="mt-2.5">
                  <input
                    type="number"
                    min="100"
                    placeholder="Or enter custom amount (Min ₹100, e.g. ₹150, ₹250)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    onBlur={() => {
                      if (customAmount && Number(customAmount) < 100) {
                        setCustomAmount("100");
                      }
                    }}
                    className={`w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/70 border rounded-xl text-slate-900 dark:text-white outline-hidden ${
                      customAmount && Number(customAmount) < 100
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                    }`}
                  />
                  {customAmount && Number(customAmount) < 100 && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">
                      ⚠️ Minimum deposit amount is ₹100 INR.
                    </p>
                  )}
                </div>
              </div>

              {/* 1-Click Payment Intent Launcher */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-blue-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        1-Click Instant App Redirect
                      </h4>
                      <p className="text-[11px] text-slate-500">Auto-fills ₹{activeUpiAmount} in your installed UPI app</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Fastest
                  </span>
                </div>

                {/* Primary Large Intent Button */}
                <button
                  type="button"
                  onClick={() => handleOpenUpiApp(genericUpiIntent)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay ₹{activeUpiAmount} via Any UPI App (Auto-Redirect)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                {/* Specific App Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenUpiApp(gpayIntent)}
                    className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-slate-50 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenUpiApp(phonepeIntent)}
                    className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-slate-50 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>PhonePe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenUpiApp(paytmIntent)}
                    className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-slate-50 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>Paytm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenUpiApp(credIntent)}
                    className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:bg-slate-50 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>CRED / BHIM</span>
                  </button>
                </div>
              </div>

              {/* Dynamic QR */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="w-44 h-44 bg-white p-2 rounded-2xl shadow-xs shrink-0 flex items-center justify-center">
                  <img 
                    src={upiQrUrl} 
                    alt="UPI QR" 
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("quickchart.io")) {
                        target.src = upiQrFallback;
                      }
                    }}
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    Or Scan & Pay ₹{activeUpiAmount}
                  </div>
                  <p className="text-[11px] text-slate-500">Scan QR from any camera or UPI app</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{upiId}</span>
                    <button
                      type="button"
                      onClick={() => copyText(upiId, "upi")}
                      className="text-blue-600 hover:text-blue-700 font-bold ml-1 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* UTR & 2 Screenshots Form */}
              <form onSubmit={handleUpiSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    1. Enter 12-Digit UTR Number
                  </label>
                  <input
                    type="text"
                    required
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 423891024819"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">Found on your UPI confirmation screen or bank SMS.</span>
                </div>

                {/* 2 Screenshots Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    2. Upload 2 Verification Screenshots
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Screenshot 1 */}
                    <div 
                      onClick={() => fileInputRef1.current?.click()}
                      className={"p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all " + (
                        screenshot1 
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30"
                      )}
                    >
                      <input
                        ref={fileInputRef1}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 1);
                        }}
                      />
                      {screenshot1 ? (
                        <div className="space-y-1.5">
                          <img src={screenshot1} alt="Receipt Preview" className="w-16 h-16 object-cover rounded-lg mx-auto shadow-xs" />
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Screenshot 1 Uploaded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {uploading1 ? "Uploading..." : "Screenshot 1: Receipt"}
                          </div>
                          <div className="text-[10px] text-slate-400">Click to upload payment receipt</div>
                        </div>
                      )}
                    </div>

                    {/* Screenshot 2 */}
                    <div 
                      onClick={() => fileInputRef2.current?.click()}
                      className={"p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all " + (
                        screenshot2 
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30"
                      )}
                    >
                      <input
                        ref={fileInputRef2}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 2);
                        }}
                      />
                      {screenshot2 ? (
                        <div className="space-y-1.5">
                          <img src={screenshot2} alt="Success Screen Preview" className="w-16 h-16 object-cover rounded-lg mx-auto shadow-xs" />
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Screenshot 2 Uploaded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {uploading2 ? "Uploading..." : "Screenshot 2: Success Screen"}
                          </div>
                          <div className="text-[10px] text-slate-400">Click to upload UPI success screen</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || uploading1 || uploading2 || !screenshot1 || !screenshot2}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting Proof..." : "Submit UPI Deposit for Verification"}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Network Selector (TRC20 vs BEP20) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Blockchain Network
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCryptoNetwork("TRC20")}
                    className={"py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer " + (
                      cryptoNetwork === "TRC20"
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={"w-2 h-2 rounded-full " + (cryptoNetwork === "TRC20" ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                      <span>TRON (TRC-20)</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold opacity-75">Recommended</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCryptoNetwork("BEP20")}
                    className={"py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer " + (
                      cryptoNetwork === "BEP20"
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={"w-2 h-2 rounded-full " + (cryptoNetwork === "BEP20" ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                      <span>BNB Chain (BEP-20)</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold opacity-75">BSC</span>
                  </button>
                </div>
              </div>

              {/* Crypto USDT selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Select USDT Amount ({cryptoNetwork})
                  </label>
                  <span className="text-[11px] text-emerald-600 font-bold">Instant Automated Credit</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setCryptoUsdt(amt);
                        setCustomCryptoUsdt("");
                      }}
                      className={"py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer " + (
                        !customCryptoUsdt && cryptoUsdt === amt
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {amt} USDT
                    </button>
                  ))}
                </div>

                <div className="mt-2.5">
                  <input
                    type="number"
                    min="1"
                    placeholder="Or enter custom USDT amount (e.g. 15, 75)"
                    value={customCryptoUsdt}
                    onChange={(e) => setCustomCryptoUsdt(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Crypto QR and Address */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-xs shrink-0 flex items-center justify-center border border-slate-100">
                  <img 
                    src={cryptoQrUrl} 
                    alt={`${cryptoNetwork} QR`} 
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("quickchart.io")) {
                        target.src = cryptoQrFallback;
                      }
                    }}
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    Send {activeCryptoAmount} USDT
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Network: <span className="font-bold text-emerald-600">{cryptoNetwork === "TRC20" ? "TRON (TRC-20)" : "BNB Smart Chain (BEP-20)"}</span>. Scan with Binance, TrustWallet, TronLink, or any Web3 wallet.
                  </p>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200 break-all text-[11px] select-all">{activeCryptoAddress}</span>
                    <button
                      type="button"
                      onClick={() => copyText(activeCryptoAddress, "crypto")}
                      className="text-emerald-600 hover:text-emerald-700 font-bold ml-1 shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCrypto ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCrypto ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Crypto Form */}
              <form onSubmit={handleCryptoSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    1. Blockchain Transaction Hash (TxID / Hash)
                  </label>
                  <input
                    type="text"
                    required
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder={cryptoNetwork === "TRC20" ? "e.g. 7f2d8a4e9b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e" : "e.g. 0x8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b"}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">
                    System verifies on-chain to prevent duplicate submissions. Final approval by Admin.
                  </span>
                </div>

                {/* 2 Screenshots Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    2. Upload 2 Verification Screenshots
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Screenshot 1 */}
                    <div 
                      onClick={() => fileInputRef1.current?.click()}
                      className={"p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all " + (
                        screenshot1 
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
                          : "border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30"
                      )}
                    >
                      <input
                        ref={fileInputRef1}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 1);
                        }}
                      />
                      {screenshot1 ? (
                        <div className="space-y-1.5">
                          <img src={screenshot1} alt="Withdrawal Receipt" className="w-16 h-16 object-cover rounded-lg mx-auto shadow-xs" />
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Screenshot 1 Uploaded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {uploading1 ? "Uploading..." : "Proof 1: Withdrawal Receipt"}
                          </div>
                          <div className="text-[10px] text-slate-400">Exchange / Wallet withdrawal receipt</div>
                        </div>
                      )}
                    </div>

                    {/* Screenshot 2 */}
                    <div 
                      onClick={() => fileInputRef2.current?.click()}
                      className={"p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all " + (
                        screenshot2 
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
                          : "border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30"
                      )}
                    >
                      <input
                        ref={fileInputRef2}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 2);
                        }}
                      />
                      {screenshot2 ? (
                        <div className="space-y-1.5">
                          <img src={screenshot2} alt="Blockchain Success" className="w-16 h-16 object-cover rounded-lg mx-auto shadow-xs" />
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Screenshot 2 Uploaded
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {uploading2 ? "Uploading..." : "Proof 2: TronScan / Success Screen"}
                          </div>
                          <div className="text-[10px] text-slate-400">Blockchain completed confirmation</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || uploading1 || uploading2 || !screenshot1 || !screenshot2}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Verifying On-Chain & Submitting..." : "Submit Crypto Deposit for Verification"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Transaction History (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131b2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <History className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Deposits (UPI & Crypto)</h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No deposits yet. Make your first deposit above.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + (
                        tx.paymentType === "CRYPTO"
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600"
                          : "bg-blue-50 dark:bg-blue-950/50 text-blue-600"
                      )}>
                        {tx.paymentType === "CRYPTO" ? <Coins className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {tx.paymentType === "CRYPTO" ? "USDT (TRC-20)" : "UPI Deposit"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {tx.paymentType === "CRYPTO" ? (
                            <span className="flex items-center gap-1">
                              TxID: {tx.txHash?.slice(0, 10)}...
                              <a 
                                href={"https://tronscan.org/#/transaction/" + tx.txHash} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                ↗
                              </a>
                            </span>
                          ) : (
                            "UTR: " + tx.utr
                          )}
                        </div>
                        {tx.screenshot1 && (
                          <div 
                            onClick={() => setPreviewImage(tx.screenshot1)}
                            className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            View Attached Proofs
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {tx.displayAmount}
                      </div>
                      <span className={"inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold " + (
                        tx.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-600"
                          : tx.status === "PENDING"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-rose-50 text-rose-600"
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified Multi-Proof Security
            </div>
            <div>All UPI and USDT deposits require 2 verification screenshots and are verified manually by admin before credit.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
