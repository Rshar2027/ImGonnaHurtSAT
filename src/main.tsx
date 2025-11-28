import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mock storage API for browser localStorage
window.storage = {
  async get(key: string) {
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },
  async set(key: string, value: string) {
    localStorage.setItem(key, value);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
