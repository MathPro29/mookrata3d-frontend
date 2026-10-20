import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../store/useAppStore';
import { 
  X, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  Globe
} from 'lucide-react';

export const QrCodeModal: React.FC = () => {
  const {
    isQrModalOpen,
    qrTargetPlaceId,
    toggleQrModal,
    places
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [networkType, setNetworkType] = useState<'network' | 'current'>('network');

  if (!isQrModalOpen) return null;

  const targetPlace = qrTargetPlaceId ? places.find(p => p.id === qrTargetPlaceId) : null;

  // Determine mobile accessible URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  // Common local network IP from dev server or current host
  const networkIp = '172.16.10.163:5173';
  const networkOrigin = `http://${networkIp}`;

  const baseOrigin = networkType === 'network' && !window.location.host.includes(networkIp)
    ? networkOrigin
    : currentOrigin;

  const voteUrl = targetPlace
    ? `${baseOrigin}/?place=${targetPlace.id}`
    : `${baseOrigin}/?view=results`;

  const handleCopy = () => {
    navigator.clipboard.writeText(voteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white m-0">สแกนเพื่อร่วมโหวตผ่านมือถือ</h2>
              <p className="text-[11px] text-zinc-400 m-0">Scan QR Code to Vote on Mobile</p>
            </div>
          </div>

          <button
            onClick={() => toggleQrModal(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target indicator if specific place */}
        {targetPlace ? (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs">
            <span className="text-amber-400 font-semibold">เป้าหมาย:</span>
            <span className="text-white font-medium truncate">{targetPlace.name}</span>
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-zinc-900/50 border-b border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
            <span>🗳️ เปิดหน้าผลโหวตและเลือกสถานที่ได้อิสระ</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center">
          
          {/* QR Code Graphic Box */}
          <div className="p-4 rounded-2xl bg-white shadow-xl ring-4 ring-zinc-800/80 flex items-center justify-center mb-4">
            <QRCodeSVG
              value={voteUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Network Switcher Tabs */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs mb-3 w-full">
            <button
              onClick={() => setNetworkType('network')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                networkType === 'network'
                  ? 'bg-zinc-800 text-amber-400 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Wi-Fi Network IP</span>
            </button>
            <button
              onClick={() => setNetworkType('current')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                networkType === 'current'
                  ? 'bg-zinc-800 text-amber-400 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Current Host</span>
            </button>
          </div>

          {/* Instruction Steps */}
          <div className="w-full text-left bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 text-[11px] text-zinc-300 space-y-1.5 mb-4">
            <div className="flex items-center gap-2 font-medium text-amber-300/90">
              <Smartphone className="w-3.5 h-3.5" />
              <span>วิธีใช้งานบนสมาร์ตโฟน:</span>
            </div>
            <p className="m-0 text-zinc-400 pl-5">1. เชื่อมต่อ Wi-Fi หรือ Hotspot เดียวกันกับเครื่องนี้</p>
            <p className="m-0 text-zinc-400 pl-5">2. เปิดแอปกล้อง (Camera) หรือ LINE สแกน QR Code</p>
            <p className="m-0 text-zinc-400 pl-5">3. กดเปิดลิงก์และร่วมโหวตสถานที่ได้ทันที</p>
          </div>

          {/* Link Box & Copy */}
          <div className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span className="truncate text-left text-[11px] pl-1">{voteUrl}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                title="คัดลอกลิงก์"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={voteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                title="เปิดในแท็บใหม่"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-400">
          <span>ระบบโหวตแบบ 1 คน 1 สิทธิ์</span>
          <button
            onClick={() => toggleQrModal(false)}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
