import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Auth0ProviderConfig } from './auth/auth0-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0ProviderConfig>
      <App />
    </Auth0ProviderConfig>
  </React.StrictMode>,
)
