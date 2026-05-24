/**
 * @fileoverview Login route — hosts the Cognito auth flow.
 */
import { Navigate } from 'react-router';
import type { ReactElement } from 'react';
import { AuthPanel } from './AuthPanel';
import { useAuth } from './context';
import { Loader } from '../components/Loader/Loader';

export function LoginPage(): ReactElement {
  const { status } = useAuth();

  if (status === 'loading') return <Loader />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <AuthPanel />;
}
