import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from '../src/redux/store.js'
import { Provider } from 'react-redux'
import axios from 'axios'

// 1. Server URL Determination
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const currentServerUrl = isLocal ? "http://localhost:8000" : "https://fyp-virtual-tryon.vercel.app";

axios.defaults.baseURL = currentServerUrl;
axios.defaults.withCredentials = true;

// 2. AXIOS INTERCEPTOR: Agar kisi component mein ghalti se "http://localhost:8000" likha ho, toh yeh usay khud live URL bana dega!
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('http://localhost:8000')) {
    config.url = config.url.replace('http://localhost:8000', currentServerUrl);
  }
  return config;
});

// 3. FETCH OVERRIDE: Fetch requests ke liye
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