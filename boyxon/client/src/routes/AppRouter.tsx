import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

const HomePage = lazy(() => import('../pages/home/HomePage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
const AuthCallback = lazy(() => import('../pages/auth/AuthCallback'));
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminDishes = lazy(() => import('../pages/admin/AdminDishes'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminPromos = lazy(() => import('../pages/admin/AdminPromos'));
const AdminPush = lazy(() => import('../pages/admin/AdminPush'));

function Fallback() {
  return <div className="min-h-screen grid place-items-center text-ink-300">Yuklanmoqda...</div>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dishes" element={<AdminDishes />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="promos" element={<AdminPromos />} />
          <Route path="push" element={<AdminPush />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
