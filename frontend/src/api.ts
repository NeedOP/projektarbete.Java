const API = "http://localhost:8080/api";

// Test if backend is reachable
export async function testBackend() {
    try {
        const response = await fetch(`${API}/auth/test`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('Backend test status:', response.status);
        const text = await response.text();
        console.log('Backend test response:', text);

        return { ok: response.ok, status: response.status, data: text };
    } catch (error) {
        console.error('Backend test failed:', error);
        return { ok: false, error};
    }
}

// Register user
export async function register(username: string, password: string) {
    console.log('📝 Frontend: Attempting registration for', username);

    try {
        const response = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        console.log('📡 Register response status:', response.status);
        const responseText = await response.text();
        console.log('📡 Register response text:', responseText);

        if (!response.ok) {
            let errorMessage = 'Registration failed';
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = responseText || `HTTP ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        // Parse successful response
        try {
            const data = JSON.parse(responseText);
            console.log('✅ Registration successful:', data);
            return data;
        } catch {
            return { success: true, message: responseText };
        }

    } catch (error: any) {
        console.error('❌ Registration error:', error);
        throw new Error(error.message || 'Registration failed');
    }
}

// Login user
export async function login(username: string, password: string) {
    console.log('🔑 Frontend: Attempting login for', username);

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include', // Important for cookies
            body: JSON.stringify({ username, password })
        });

        console.log('📡 Login response status:', response.status);
        const responseText = await response.text();
        console.log('📡 Login response text:', responseText);

        if (!response.ok) {
            let errorMessage = 'Login failed';
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = responseText || `HTTP ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        // Parse successful response
        try {
            const data = JSON.parse(responseText);
            console.log('✅ Login successful:', data);

            // Store username in localStorage for frontend
            if (data.username) {
                localStorage.setItem('username', data.username);
                localStorage.setItem('isAdmin', data.roles?.includes('ROLE_ADMIN') ? 'true' : 'false');
            }

            return data;
        } catch {
            return { success: true, message: responseText };
        }

    } catch (error: any) {
        console.error('❌ Login error:', error);
        throw new Error(error.message || 'Login failed');
    }
}

// Logout
export async function logout() {
    try {
        const response = await fetch(`${API}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        // Clear frontend storage
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// Check if user is admin
export async function checkAdmin(): Promise<boolean> {
    try {
        // First check localStorage for quick response
        const storedAdmin = localStorage.getItem('isAdmin');
        if (storedAdmin === 'true') {
            return true;
        }

        // Then check with backend
        const response = await fetch(`${API}/admin/users`, {
            method: 'GET',
            credentials: 'include'
        });

        return response.ok;
    } catch {
        return false;
    }
}

// Get single product
export async function getProduct(id: number) {
    const res = await fetch(`${API}/products/${id}`, {
        credentials: 'include'
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
}
// Save product (create or update)
export async function saveProduct(product: any, id?: number) {
    console.log('🚀 Saving product:', product);
    console.log('📝 ID provided:', id);

    // Determine URL and method
    let url = 'http://localhost:8080/api/products';
    let method = 'POST';

    if (id) {
        url = `http://localhost:8080/api/products/${id}`;
        method = 'PUT';
        console.log('🔄 Updating existing product');
    } else {
        console.log('➕ Creating new product');
    }

    // Make the request
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include', // Send cookies for authentication
            body: JSON.stringify(product)
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response OK?', response.ok);

        const responseText = await response.text();
        console.log('📡 Response text:', responseText);

        if (!response.ok) {
            console.error('❌ Server error response:', responseText);
            throw new Error(`Failed to save product: ${response.status} ${responseText}`);
        }

        // Try to parse JSON
        try {
            const data = JSON.parse(responseText);
            console.log('✅ Product saved successfully:', data);
            return data;
        } catch (e) {
            console.log('⚠️ Response was not JSON, returning text:', responseText);
            return responseText;
        }

    } catch (error: any) {
        console.error('💥 Network/fetch error:', error);
        throw new Error(`Network error: ${error.message}`);
    }
}
// Delete product
export async function deleteProduct(id: number) {
    const res = await fetch(`${API}/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete product');
    }
}

// Get current user info
export async function getCurrentUser() {
    try {
        const res = await fetch(`${API}/auth/me`, {
            credentials: 'include'
        });
        if (res.ok) {
            return res.json();
        }
        return null;
    } catch {
        return null;
    }
}

// List all products
export async function listProducts() {
    try {
        const res = await fetch(`${API}/products`, {
            credentials: "include",
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            // If unauthorized, return empty array instead of error
            if (res.status === 401 || res.status === 403) {
                return [];
            }
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch products");
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Create order
export async function createOrder(items: {productId:number,quantity:number}[]) {
    const res = await fetch(`${API}/orders/checkout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ items })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Checkout failed');
    }

    return res.json();
}

// Test API connection
export async function testConnection() {
    return testBackend();
}