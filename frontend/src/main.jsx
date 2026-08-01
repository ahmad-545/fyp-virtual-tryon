import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from '../src/redux/store.js'
import { Provider } from 'react-redux'
import axios from 'axios'

// Global Axios Base URL Setup
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
axios.defaults.baseURL = isLocal ? "http://localhost:8000" : "https://fyp-virtual-tryon.vercel.app";
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)