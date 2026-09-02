import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Polyfill window.storage for NCDatabase (localStorage-backed)
if (!window.storage) {
  window.storage = {
    async get(key) {
      try {
        const value = localStorage.getItem(key)
        return value == null ? null : { value }
      } catch {
        return null
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value)
        return true
      } catch {
        return false
      }
    },
    async delete(key) {
      try {
        localStorage.removeItem(key)
        return true
      } catch {
        return false
      }
    },
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
// trigger deploy Wed Sep  2 09:28:53 PM WIB 2026
