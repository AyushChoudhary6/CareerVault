// Add this to clear any stored auth state that might be causing loops
const clearAuthState = () => {
  localStorage.clear();
  sessionStorage.clear();
  // Clear any oidc client state
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('oidc.')) {
      localStorage.removeItem(key);
    }
  });
  window.location.reload();
};

// You can call this function in browser console: clearAuthState()
window.clearAuthState = clearAuthState;

console.log('Auth state clearer loaded. Call clearAuthState() in console if needed.');
