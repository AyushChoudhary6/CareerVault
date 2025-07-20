import { useAuth } from "react-oidc-context"

function App() {
  const auth = useAuth();

  console.log('App render - Auth state:', {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    activeNavigator: auth.activeNavigator,
    error: auth.error?.message
  });

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <div>Welcome {auth.user?.profile?.email || 'User'}</div>
        <button onClick={() => auth.removeUser()}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <div>Please sign in</div>
      <button onClick={() => auth.signinRedirect()}>Login</button>
    </div>
  );
}

export default App;
