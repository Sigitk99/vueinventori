import { useAuthStore } from '@/stores';

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE')
};

function request(method) {
    return async (url, body) => {
        const requestOptions = {
            method,
            headers: authHeader(url)
        };
        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(url, requestOptions);
            return await handleResponse(response);
        } catch (error) {
            return Promise.reject(error);
        }
    };
}

// Helper functions
function authHeader(url) {
    // Get the token directly from the store context or pass it as an argument
    const { user } = useAuthStore();
    const isLoggedIn = !!user?.token;
    const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);
    
    // If logged in and the URL matches the API URL, add the Authorization header
    if (isLoggedIn && isApiUrl) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
}

async function handleResponse(response) {
    const isJson = response.headers?.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // Handle error responses
    if (!response.ok) {
        const { user, logout } = useAuthStore();
        if ([401, 403].includes(response.status) && user) {
            // Automatically log out if 401 or 403 status is returned from the API
            logout();
        }

        // Get the error message from the response or use the status code
        const error = (data && data.message) || response.statusText || response.status;
        return Promise.reject(error);
    }

    return data;
}
