import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const AUDIENCES = [
  { v: 'all', l: 'Barchasi' },
  { v: 'active', l: 'Faol (30 kun)' },
  { v: 'new', l: 'Yangi (7 kun)' },
];

export function PushSendPanel() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);

  const send = async (): Promise<void> => {
    if (!title.trim() || !message.trim()) return toast.error('Sarlavha va matn kiriting');
    setSending(true);
    try {
      const r = await adminApi.sendPush({ title, message, audience });
      toast.success(r.message);
      setTitle('');
      setMessage('');
    } catch (e) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Yuborilmadi');
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'h-11 w-full rounded-xl border border-ink-line px-3 text-sm outline-none focus:border-primary-500';

  return (
    <Card className="max-w-xl space-y-4 p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-100 text-primary-600">
          <Megaphone className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display font-bold">Push xabar yuborish</p>
          <p className="text-xs text-ink-300">VAPID sozlangan bo‘lsa brauzerda chiqadi, aks holda in-app bildirishnoma yaratiladi.</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink-700">Auditoriya</label>
        <div className="flex gap-2">
          {AUDIENCES.map((a) => (
            <button
              key={a.v}
              onClick={() => setAudience(a.v)}
              className={`rounded-full border px-3 py-1.5 text-sm ${audience === a.v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-ink-line'}`}
            >
              {a.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink-700">Sarlavha *</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Yangi taomlar!" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink-700">Matn *</label>
        <textarea rows={3} className={`${inputCls} h-auto py-2`} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      <Button className="w-full" onClick={() => void send()} disabled={sending}>
        {sending ? 'Yuborilmoqda...' : 'Yuborish'}
      </Button>
    </Card>
  );
}
