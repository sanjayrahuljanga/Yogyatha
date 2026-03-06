import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 🛡️ BRINGING THE ROUTER BACK!
import App from './App.jsx';
import './index.css';
import './i18n'; // 🌐 The translation engine stays!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);