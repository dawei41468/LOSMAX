export async function login(
  email: string,
  password: string,
  setAuthState: (authenticated: boolean) => void,
  navigate: (path: string) => void
): Promise<void> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: formData.toString(),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  // 'name' is a parameter to the register function.
  // The response from the server will also contain 'name'.
  // Let's ensure we destructure it correctly, possibly aliasing if needed,
  // though the previous diff already aliased it to userNameFromResponse.
  // The backend's Token model now returns 'name', so we expect it here.
  const { access_token, refresh_token, user_id, name: nameReturnedByApi } = await response.json();
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('userId', user_id); // userId is the email
  if (nameReturnedByApi) { // Use the name returned by the API
    localStorage.setItem('userName', nameReturnedByApi);
  }
  setAuthState(true);
  navigate('/dashboard');
}

export async function register(
  email: string,
  password: string,
  name: string,
  setAuthState: (authenticated: boolean) => void,
  navigate: (path: string) => void
): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const { access_token, refresh_token, user_id, name: userNameFromResponse } = await response.json(); // Alias 'name' from response
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('userId', user_id); // userId is the email
  if (userNameFromResponse) {
    localStorage.setItem('userName', userNameFromResponse);
  }
  setAuthState(true);
  navigate('/dashboard');
}

export async function logout(setAuthState: (authenticated: boolean) => void): Promise<void> {
    const token = localStorage.getItem('access_token');
    try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        // Always clear tokens regardless of API response
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName'); // Also remove userName on logout
        setAuthState(false);
    }
}

export async function refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    // Skip refresh if token is empty
    if (!refreshToken || refreshToken.trim() === '') {
        throw new Error('No refresh token available');
    }
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const { access_token, refresh_token } = await response.json();
        // Only update tokens if new ones are provided
        if (access_token && refresh_token) {
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
        }
        return access_token;
    } catch (error) {
        // Don't clear tokens on network errors
        if (error instanceof TypeError) {
            throw new Error('Network error during token refresh');
        }
        throw error;
    }
}