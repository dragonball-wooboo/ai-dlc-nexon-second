import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TableDetailPage } from './pages/TableDetailPage';
import { MenuManagePage } from './pages/MenuManagePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="layout__nav">
        <div className="layout__nav-links">
          <Link
            to="/dashboard"
            className={`layout__nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            주문 현황
          </Link>
          <Link
            to="/menus"
            className={`layout__nav-link ${location.pathname === '/menus' ? 'active' : ''}`}
          >
            메뉴 관리
          </Link>
        </div>
        <button className="btn btn--secondary layout__logout" onClick={logout}>
          로그아웃
        </button>
      </nav>
      <main className="layout__content">{children}</main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TableDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/menus"
          element={
            <ProtectedRoute>
              <Layout>
                <MenuManagePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
