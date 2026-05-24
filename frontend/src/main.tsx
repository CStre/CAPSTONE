/**
 * @fileoverview Application entry — configures services and mounts React.
 *
 * Reads the Vite env here (the one place that touches import.meta.env) and
 * passes the resolved values into the otherwise env-free modules.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Provider as GraphQLProvider } from 'urql';
import { defineElement } from '@lordicon/element';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './lib/ThemeContext';
import { configureAuth } from './auth/config';
import { getIdToken } from './auth/session';
import { createGraphQLClient } from './lib/graphql';
import './index.css';

// Register the <lord-icon> custom element so the animated icons render anywhere.
defineElement();

// Cognito is provisioned in Phase 3; until the env is populated, skip configuration
// so auth calls fail gracefully rather than the app crashing at startup.
if (import.meta.env.VITE_COGNITO_USER_POOL_ID && import.meta.env.VITE_COGNITO_CLIENT_ID) {
  configureAuth(import.meta.env.VITE_COGNITO_USER_POOL_ID, import.meta.env.VITE_COGNITO_CLIENT_ID);
}

const graphqlClient = createGraphQLClient(import.meta.env.VITE_GRAPHQL_URL, getIdToken);

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <GraphQLProvider value={graphqlClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </GraphQLProvider>
    </ThemeProvider>
  </StrictMode>,
);
