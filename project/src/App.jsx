import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from './declarations/social_backend';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);

      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const identity = client.getIdentity();
        const actor = createActor(process.env.CANISTER_ID_SOCIAL_BACKEND, {
          agentOptions: { identity }
        });
        setActor(actor);
        
        // Get current user profile
        try {
          const user = await actor.get_current_user();
          setCurrentUser(user[0] || null);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await authClient.login({
        identityProvider: process.env.NODE_ENV === 'development' 
          ? `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`
          : 'https://identity.ic0.app',
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const actor = createActor(process.env.CANISTER_ID_SOCIAL_BACKEND, {
            agentOptions: { identity }
          });
          setActor(actor);
          setIsAuthenticated(true);
          
          // Try to get existing profile or create one
          try {
            const user = await actor.get_current_user();
            if (user[0]) {
              setCurrentUser(user[0]);
            } else {
              // Create default profile
              const newProfile = await actor.create_profile({
                username: [],
                name: [],
                bio: [],
                profile_photo: [],
                cover_photo: []
              });
              setCurrentUser(newProfile);
            }
          } catch (error) {
            console.error('Error handling user profile:', error);
          }
        },
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setActor(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {isAuthenticated ? (
        <Dashboard 
          actor={actor} 
          currentUser={currentUser} 
          onLogout={handleLogout}
          onUserUpdate={setCurrentUser}
        />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;