import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import { AuthProvider } from "react-oidc-context"
import './debug-auth.js'

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_v4ye13dY9",
  client_id: "i8jchcrgo7dh2ddcdnjlbv14b",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "phone openid email",
  automaticSilentRenew: false,
  loadUserInfo: false,
  revokeAccessTokenOnSignout: true,
  includeIdTokenInSilentRenew: false,
  monitorSession: false,
  checkSessionInterval: 0,
  onSigninCallback: () => {
    console.log('Signin callback triggered');
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  onSignoutCallback: () => {
    console.log('Signout callback triggered');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

createRoot(document.getElementById('root')).render(
  <AuthProvider {...cognitoAuthConfig}>
    <App />
  </AuthProvider>
)
