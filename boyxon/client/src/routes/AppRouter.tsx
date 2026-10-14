import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { VerifiedRoute } from './VerifiedRoute';

const HomePage = lazy(() => import('../pages/home/HomePage'));
const DishPage = lazy(() => import('../pages/dish/DishPage'));
const CartPage = lazy(() => import('../pages/cart/CartPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
const AuthCallback = lazy(() => import('../pages/auth/AuthCallback'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminDishes = lazy(() => import('../pages/admin/AdminDishes'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminPromos = lazy(() => import('../pages/admin/AdminPromos'));
const AdminPush = lazy(() => import('../pages/admin/AdminPush'));
const OrderDetailPage = lazy(() => import('../pages/order/OrderDetailPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function Fallback() {
  return <div className="min-h-screen grid place-items-center text-ink-300">...</div>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Email tasdiqlash: token bilan (havoladan) yoki tokensiz (kutish ekrani). */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        {/* Parolni tiklash: email kiritish + havoladagi token bilan yangi parol. */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dish/:slug" element={<DishPage />} />
          <Route path="/cart" element={<ProtectedRoute><VerifiedRoute><CartPage /></VerifiedRoute></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><VerifiedRoute><SettingsPage /></VerifiedRoute></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><VerifiedRoute><OrderDetailPage /></VerifiedRoute></ProtectedRoute>} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dishes" element={<AdminDishes />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="promos" element={<AdminPromos />} />
          <Route path="push" element={<AdminPush />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}