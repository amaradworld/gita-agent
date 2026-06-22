import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '12px' } }} />
    <App />
  </React.StrictMode>
);
