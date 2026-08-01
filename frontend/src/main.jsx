import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from '../src/redux/store.js'
import { Provider } from 'react-redux'
import axios from 'axios'

// 1. Global Axios Base URL Setup
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const currentServerUrl = isLocal ? "http://localhost:8000" : "https://fyp-virtual-tryon.vercel.app";

axios.defaults.baseURL = currentServerUrl;
axios.defaults.withCredentials = true;

// 2. FETCH OVERRIDE: Taaqe kisi bhi page par fetch mein localhost likha ho toh wo khud live URL ban jaye!
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.includes('http://localhost:8000')) {
    resource = resource.replace('http://localhost:8000', currentServerUrl);
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)