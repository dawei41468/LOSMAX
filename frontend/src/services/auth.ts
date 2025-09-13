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

  // Capture the language chosen pre-login (if any) before we potentially override it with server value
  const preLoginLanguage = localStorage.getItem('userLanguage');

  const { access_token, refresh_token, user_id, name: nameReturnedByApi, language, role } = await response.json(); // Added role
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('userId', user_id); // This is the MongoDB ID
  localStorage.setItem('userEmail', email); // Store the email used for login
  if (nameReturnedByApi) { // Use the name returned by the API
    localStorage.setItem('userName', nameReturnedByApi);
  }
  // Decide which language to persist: prefer pre-login chosen language if it exists
  if (preLoginLanguage && preLoginLanguage !== language) {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({ language: preLoginLanguage }),
        credentials: 'include'
      });
      localStorage.setItem('userLanguage', preLoginLanguage);
    } catch {
      // If this fails, fall back to server language if provided
      if (language) {
        localStorage.setItem('userLanguage', language);
      }
    }
  } else if (language) {
    localStorage.setItem('userLanguage', language);
  }
  if (role) { // Store userRole if present in response
    localStorage.setItem('userRole', role);
  }
  setAuthState(true);
  // Navigate to returnTo if provided and safe (same-origin path), else default by role
  try {
    const params = new URLSearchParams(window.location.search);
    const returnToRaw = params.get('returnTo');
    const returnTo = returnToRaw ? decodeURIComponent(returnToRaw) : null;
    const isSafePath = !!returnTo && returnTo.startsWith('/');
    navigate(isSafePath ? returnTo! : (role === 'Admin' ? '/admin' : '/dashboard'));
  } catch {
    navigate(role === 'Admin' ? '/admin' : '/dashboard');
  }
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
 
  // Capture pre-login language preference before reading server response
  const preLoginLanguage = localStorage.getItem('userLanguage');

  const { access_token, refresh_token, user_id, name: userNameFromResponse, language, role } = await response.json(); // Added role
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('userId', user_id); // This is the MongoDB ID
  localStorage.setItem('userEmail', email); // Store the email used for registration
  if (userNameFromResponse) {
    localStorage.setItem('userName', userNameFromResponse);
  }
  if (preLoginLanguage && preLoginLanguage !== language) {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({ language: preLoginLanguage }),
        credentials: 'include'
      });
      localStorage.setItem('userLanguage', preLoginLanguage);
    } catch {
      if (language) {
        localStorage.setItem('userLanguage', language);
      }
    }
  } else if (language) {
    localStorage.setItem('userLanguage', language);
  }
  if (role) { // Store userRole if present in response
    localStorage.setItem('userRole', role);
  }
  setAuthState(true);
  // Navigate to returnTo if provided and safe (same-origin path), else default by role
  try {
    const params = new URLSearchParams(window.location.search);
    const returnToRaw = params.get('returnTo');
    const returnTo = returnToRaw ? decodeURIComponent(returnToRaw) : null;
    const isSafePath = !!returnTo && returnTo.startsWith('/');
    navigate(isSafePath ? returnTo! : (role === 'Admin' ? '/admin' : '/dashboard'));
  } catch {
    navigate(role === 'Admin' ? '/admin' : '/dashboard');
  }
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
        localStorage.removeItem('userEmail'); // Remove userEmail on logout
        localStorage.removeItem('userRole'); // Remove userRole on logout
        localStorage.removeItem('userName'); // Also remove userName on logout
        localStorage.removeItem('userLanguage'); // Also remove userLanguage on logout
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
 
        const { access_token, refresh_token, name, user_id, language, role } = await response.json(); // Destructure name, user_id, language, and role
        // Only update tokens if new ones are provided
        if (access_token) { // refresh_token might not always be present if rotation is off
            localStorage.setItem('access_token', access_token);
        }
        if (refresh_token) { // Only set if backend sends it (rotation might be off)
            localStorage.setItem('refresh_token', refresh_token);
        }
        if (name) {
            localStorage.setItem('userName', name);
        }
        if (user_id) { // Though userId is also in token, good to keep consistent if API sends it
            localStorage.setItem('userId', user_id);
        }
        if (language) {
            localStorage.setItem('userLanguage', language);
        }
        if (role) { // Store userRole if present in response
            localStorage.setItem('userRole', role);
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