import React, { useEffect, useState } from 'react';
import { Clock3, LockKeyhole, X } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { VotingService } from '../services/votingService';
import { useAppStore } from '../store/useAppStore';

interface VotingSessionControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

const toLocalDateTimeInput = (value: string) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export const VotingSessionControls: React.FC<VotingSessionControlsProps> = ({ isOpen, onClose }) => {
  const { activeSession, setVotingSession } = useAppStore();
  const [adminKey, setAdminKey] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isClosed = activeSession?.status === 'completed';

  useEffect(() => {
    if (isOpen && activeSession) {
      const defaultEnd = activeSession.status === 'completed'
        ? new Date(Date.now() + 60 * 60_000).toISOString()
        : activeSession.ends_at;
      setEndsAt(toLocalDateTimeInput(defaultEnd));
    }
  }, [isOpen, activeSession]);

  if (!isOpen) return null;

  const runAction = async (action: 'set_end_time' | 'close_now' | 'reopen') => {
    if (!activeSession) return;
    setMessage('');
    if (!adminKey.trim()) {
      setMessage('กรุณากรอกรหัสผู้ดูแล');
      return;
    }
    if (action === 'set_end_time' && (!endsAt || Date.parse(endsAt) <= Date.now())) {
      setMessage('เวลาปิดโหวตต้องอยู่ในอนาคต');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await VotingService.manageVotingSession(
        adminKey,
        activeSession.id,
        action,
        action !== 'close_now' ? new Date(endsAt).toISOString() : undefined,
      );
      setVotingSession(updated);
      setMessage(action === 'close_now' ? 'ปิดโหวตและล้างคะแนนแล้ว' : action === 'reopen' ? 'เปิดโหวตรอบใหม่แล้ว คะแนนเริ่มจากศูนย์' : 'บันทึกเวลาปิดโหวตแล้ว');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const canManage = isSupabaseConfigured && (activeSession?.status === 'active' || isClosed);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={event => {
      if (event.target === event.currentTarget && !isSaving) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="vote-session-title" className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="vote-session-title" className="m-0 text-base font-bold">ตั้งเวลาปิดโหวต</h2>
              <p className="mb-0 mt-1 text-xs text-zinc-400">{activeSession?.title || 'ยังไม่มีรอบโหวต'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="ปิดหน้าต่าง" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isSupabaseConfigured ? (
          <p className="mb-0 mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-100">
            ต้องเชื่อมต่อ Supabase และ deploy Edge Functions ก่อน จึงจะจำกัดโหวตตาม IP และจัดการเวลาปิดจากส่วนกลางได้
          </p>
        ) : !activeSession ? (
          <p className="mb-0 mt-5 text-sm text-zinc-300">ยังไม่มีรอบโหวตในฐานข้อมูล</p>
        ) : isClosed ? (
          <div className="mt-5 space-y-4">
            <p className="m-0 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-100">คะแนนโหวตรอบก่อนถูกล้างแล้ว รอบใหม่จะเริ่มจากศูนย์</p>
            <div>
              <label htmlFor="vote-end-time" className="mb-1.5 block text-xs font-medium text-zinc-300">กำหนดเวลาปิดรอบที่เปิดใหม่</label>
              <input id="vote-end-time" type="datetime-local" value={endsAt} onChange={event => setEndsAt(event.target.value)} disabled={isSaving} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400" />
            </div>
            <div>
              <label htmlFor="vote-admin-key" className="mb-1.5 block text-xs font-medium text-zinc-300">รหัสผู้ดูแล</label>
              <input id="vote-admin-key" type="password" autoComplete="current-password" value={adminKey} onChange={event => setAdminKey(event.target.value)} disabled={isSaving} placeholder="กรอกรหัสผู้ดูแล" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-amber-400" />
              <p className="mb-0 mt-1.5 text-[11px] text-zinc-500">รหัสนี้ใช้ตรวจสิทธิ์ตอนบันทึก และไม่ถูกเก็บไว้ในเครื่อง</p>
            </div>
            {message && <p className="m-0 text-sm text-amber-200" role="status" aria-live="polite">{message}</p>}
            <button type="button" onClick={() => void runAction('reopen')} disabled={!canManage || isSaving} className="w-full rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">{isSaving ? 'กำลังบันทึก…' : 'เริ่มโหวตรอบใหม่'}</button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="vote-end-time" className="mb-1.5 block text-xs font-medium text-zinc-300">วันและเวลาปิดโหวต</label>
              <input
                id="vote-end-time"
                type="datetime-local"
                value={endsAt}
                onChange={event => setEndsAt(event.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label htmlFor="vote-admin-key" className="mb-1.5 block text-xs font-medium text-zinc-300">รหัสผู้ดูแล</label>
              <input
                id="vote-admin-key"
                type="password"
                autoComplete="current-password"
                value={adminKey}
                onChange={event => setAdminKey(event.target.value)}
                disabled={isSaving}
                placeholder="กรอกรหัสผู้ดูแล"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-amber-400"
              />
              <p className="mb-0 mt-1.5 text-[11px] text-zinc-500">รหัสนี้ใช้ตรวจสิทธิ์ตอนบันทึก และไม่ถูกเก็บไว้ในเครื่อง</p>
            </div>
            {message && <p className="m-0 text-sm text-amber-200" role="status" aria-live="polite">{message}</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => void runAction('close_now')}
                disabled={!canManage || isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LockKeyhole className="h-4 w-4" />
                {isSaving ? 'กำลังบันทึก…' : 'ปิดโหวตทันที'}
              </button>
              <button
                type="button"
                onClick={() => void runAction('set_end_time')}
                disabled={!canManage || isSaving}
                className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSaving ? 'กำลังบันทึก…' : 'บันทึกเวลา'}
              </button>
            </div>
          </div>
        )}

        {(!isSupabaseConfigured || !activeSession) && (
          <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-700">ปิด</button>
        )}
      </section>
    </div>
  );
};
