import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { User } from '../../types';
import { adminApi } from '../../api/admin.api';
import { formatDate } from '../../lib/format';

export function UsersTable({ users, loading }: { users: User[]; loading?: boolean }) {
  const qc = useQueryClient();
  const roleM = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.changeRole(id, role),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Rol yangilandi'); },
    onError: () => toast.error('Rol o‘zgarmadi'),
  });
  const blockM = useMutation({
    mutationFn: ({ id, block }: { id: string; block: boolean }) => adminApi.toggleBlock(id, block),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Holat yangilandi'); },
  });

  if (loading) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">Yuklanmoqda...</div>;
  if (!users.length) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">Foydalanuvchilar yo‘q</div>;

  return (
    <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="border-b border-ink-line bg-black/5 dark:bg-white/10 text-left text-xs text-ink-300">
          <tr>
            <th className="px-4 py-3">Ism</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Sana</th>
            <th className="px-4 py-3">Holat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-line/60">
          {users.map((u) => (
            <tr key={u._id}>
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-ink-300">{u.email}</td>
              <td className="px-4 py-3">
                <select
                  value={u.role}
                  onChange={(e) => roleM.mutate({ id: u._id, role: e.target.value })}
                  className="h-8 rounded-lg border border-ink-line bg-surface px-1.5 text-xs outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-4 py-3 text-ink-300">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => blockM.mutate({ id: u._id, block: u.isActive })}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                >
                  {u.isActive ? 'Faol' : 'Bloklangan'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
