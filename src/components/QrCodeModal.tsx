import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, ExternalLink, QrCode, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const QrCodeModal: React.FC = () => {
  const { isQrModalOpen, qrTargetPlaceId, toggleQrModal, places } = useAppStore();
  const [copied, setCopied] = useState(false);
  if (!isQrModalOpen) return null;

  const targetPlace = places.find(place => place.id === qrTargetPlaceId);
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('view', 'results');
  if (targetPlace) url.searchParams.set('place', targetPlace.id);
  const voteUrl = url.toString();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(voteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) toggleQrModal(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="qr-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 text-zinc-950 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><QrCode className="h-5 w-5" /><h2 id="qr-title" className="m-0 text-lg font-black">สแกนเพื่อโหวต</h2></div><button onClick={() => toggleQrModal(false)} aria-label="ปิด QR" className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-zinc-100"><X className="h-5 w-5" /></button></div>
        <p className="mb-5 mt-2 text-sm text-zinc-600">{targetPlace ? `เปิดหน้าผลโหวตและเลือกร้าน ${targetPlace.name}` : 'เปิดหน้าผลโหวตบนมือถือเพื่อเลือกร้านที่ชอบ'}</p>
        <div className="mx-auto w-fit rounded-xl border border-zinc-200 bg-white p-4"><QRCodeSVG value={voteUrl} size={220} level="H" includeMargin={false} /></div>
        <p className="mt-4 break-all text-center text-xs text-zinc-500">{voteUrl}</p>
        <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => void copyLink()} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 text-sm font-bold hover:bg-zinc-100">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</button><a href={voteUrl} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-bold text-white hover:bg-zinc-800"><ExternalLink className="h-4 w-4" />เปิดหน้าผลโหวต</a></div>
        {window.location.hostname === 'localhost' && <p className="mb-0 mt-4 text-xs text-zinc-500">สำหรับสแกนจากมือถือ ให้เปิดเว็บผ่านที่อยู่ที่มือถือเข้าถึงได้ก่อน</p>}
      </section>
    </div>
  );
};
