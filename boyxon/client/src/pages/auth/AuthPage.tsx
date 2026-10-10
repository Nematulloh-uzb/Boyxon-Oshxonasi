import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { loginValidator, registerValidator, type LoginForm, type RegisterForm } from '../../lib/validators';
import type { User } from '../../types';

export default function AuthPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { accessToken, setToken, setUser, user } = useAuthStore();

  useEffect(() => {
    if (accessToken) nav(user?.role === 'admin' ? '/admin' : '/', { replace: true });
  }, [accessToken, user, nav]);

  const from = (loc.state as { from?: string } | null)?.from ?? '/';

  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      <div className="relative flex flex-col justify-between bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white md:p-12">
        <p className="font-display text-2xl font-extrabold">Boyxon Oshxonasi</p>
        <div className="hidden md:block">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Milliy taomlar,<br />issiq yetkazib berish
          </h1>
          <p className="mt-3 max-w-sm text-white/80">Palov, somsa, kabob — Toshkent bo‘ylab 45 daqiqada.</p>
        </div>
        <p className="text-sm text-white/70">© {new Date().getFullYear()} Boyxon</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <AuthForm from={from} onDone={(token, u) => { setToken(token); setUser(u); nav(u.role === 'admin' ? '/admin' : from, { replace: true }); }} />
        </div>
      </div>
    </div>
  );
}
