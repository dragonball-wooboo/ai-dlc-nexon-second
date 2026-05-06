import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { OrderPage } from './pages/OrderPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/menu" replace /> : <LoginPage />} />
      <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  );
}

function BottomNav() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;

  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      <a href="/menu" className="nav-item">메뉴</a>
      <a href="/cart" className="nav-item">장바구니</a>
      <a href="/orders" className="nav-item">주문내역</a>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <AppRoutes />
          <BottomNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
