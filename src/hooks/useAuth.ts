import { useAuth0 } from '@auth0/auth0-react';

export function useAuth() {
  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const login = async () => {
    await loginWithRedirect();
  };

  const logoutUser = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return {
    user: isAuthenticated ? {
      id: user?.sub,
      email: user?.email,
      name: user?.name,
      picture: user?.picture,
    } : null,
    login,
    logout: logoutUser,
    isLoading,
    getAccessToken: getAccessTokenSilently,
    isAuthenticated,
  };
} 