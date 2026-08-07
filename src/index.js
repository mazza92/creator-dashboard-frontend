import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryProvider } from './providers/QueryProvider';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import { message } from 'antd';
axios.defaults.withCredentials = true;

// Global toast behavior — visual style lives in index.css (.ant-message overrides)
message.config({
  top: 16,
  duration: 3,
  maxCount: 2,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </HelmetProvider>
);

if (reportWebVitals) {
  reportWebVitals(console.log);
}