/**
 * @fileoverview Application routes and shared layout.
 */
import { Navigate, Outlet, Route, Routes } from 'react-router';
import type { ReactElement } from 'react';
import { Header } from './components/Header/Header';
import { CustomCursor } from './components/CustomCursor/CustomCursor';
import { Loader } from './components/Loader/Loader';
import { useAuth } from './auth/context';
import { HomePage } from './pages/HomePage/HomePage';
import { LearnPage } from './pages/LearnPage/LearnPage';
import { SourcesPage } from './pages/SourcesPage/SourcesPage';
import { LoginPage } from './auth/LoginPage';
import { TravelPage } from './pages/TravelPage/TravelPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { AccountPage } from './pages/AccountPage/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { IntroProvider } from './lib/IntroContext';
import './App.css';

/** Page chrome shared by every route. */
function Layout(): ReactElement {
  const { status } = useAuth();
  return (
    <IntroProvider>
      <CustomCursor />
      <Header />
      {status === 'loading' && <Loader />}
      <main className="app-main">
        <Outlet />
      </main>
    </IntroProvider>
  );
}

/** Gate for routes that require a signed-in user. */
function ProtectedRoute(): ReactElement | null {
  const { status } = useAuth();
  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** The application's route table. */
export function App(): ReactElement {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="travel" element={<TravelPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
