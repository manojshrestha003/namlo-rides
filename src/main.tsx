
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RideProvider } from './context/RideContext';
import { AuthProvider } from './context/authContext';
import React from 'react';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RideProvider>
        <App />
      </RideProvider>
    </AuthProvider>
  </React.StrictMode>
);

