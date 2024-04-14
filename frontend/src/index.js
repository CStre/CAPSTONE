import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthProvider } from './AuthContext';

// Setup axios with CSRF token from cookies
const csrfToken = Cookies.get('csrftoken');
axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
