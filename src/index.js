import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/global.css';
import App from './App';

import "./i18n/i18n";

import { CartProvider } from './context/CartContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ThemeProvider } from './context/ThemeContext';
import { BusinessProvider } from './context/BusinessContext';
import { ToastProvider } from './components/ui/Toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <BusinessProvider>
          <SubscriptionProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </SubscriptionProvider>
        </BusinessProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
