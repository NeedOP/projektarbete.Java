import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    // Check login status on component mount and on route changes
    useEffect(() => {
        checkLoginStatus();

        // Listen for storage changes (when login/logout happens)
        const handleStorageChange = () => {
            checkLoginStatus();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Also check when URL changes
    useEffect(() => {
        checkLoginStatus();
    }, [window.location.pathname]);

    async function checkLoginStatus() {
        console.log('🔍 Checking login status...');

        // Check localStorage first (fast)
        const storedUsername = localStorage.getItem('username');
        const storedAdmin = localStorage.getItem('isAdmin') === 'true';

        if (storedUsername) {
            console.log('📱 Found user in localStorage:', storedUsername);
            setUsername(storedUsername);
            setIsAdmin(storedAdmin);
            return;
        }

        // Check cookies
        const cookies = document.cookie.split(';');
        const jwtCookie = cookies.find(c => c.includes('JWT='));
        const userCookie = cookies.find(c => c.includes('username='));

        if (jwtCookie && userCookie) {
            const username = userCookie.split('=')[1].trim();
            console.log('🍪 Found user in cookies:', username);
            setUsername(username);

            // Check if admin
            try {
                const response = await fetch('http://localhost:8080/api/admin/users', {
                    method: 'GET',
                    credentials: 'include'
                });
                setIsAdmin(response.ok);
                if (response.ok) {
                    localStorage.setItem('isAdmin', 'true');
                }
            } catch {
                setIsAdmin(false);
            }

            // Store in localStorage for future
            localStorage.setItem('username', username);
        } else {
            console.log('👤 No user logged in');
            setUsername(null);
            setIsAdmin(false);
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
        }
    }

    async function handleLogout() {
        try {
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear everything
        setUsername(null);
        setIsAdmin(false);
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        document.cookie = 'JWT=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = 'username=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

        navigate('/login');
    }

    return (
        <nav style={styles.navbar}>
            <div style={styles.logo}>
                <Link to="/" style={styles.logoLink}>🛒 E-Shop</Link>
            </div>

            <div style={styles.navLinks}>
                <Link to="/" style={styles.navLink}>Home</Link>
                <Link to="/products" style={styles.navLink}>Products</Link>
                <Link to="/cart" style={styles.navLink}>Cart 🛒</Link>

                {username ? (
                    <>
                        <span style={styles.welcome}>
                            Welcome, {username}!
                            {isAdmin && <span style={styles.adminBadge}> ADMIN</span>}
                        </span>

                        {isAdmin && (
                            <Link to="/admin/add-product" style={styles.addProductLink}>
                                + Add Product
                            </Link>
                        )}

                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.navLink}>Login</Link>
                        <Link to="/register" style={styles.registerBtn}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        backgroundColor: '#2c3e50',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        position: 'sticky' as 'sticky',
        top: 0,
        zIndex: 1000
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold'
    },
    logoLink: {
        color: 'white',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
    },
    navLink: {
        color: '#ecf0f1',
        textDecoration: 'none',
        fontSize: '1rem',
        padding: '0.5rem',
        borderRadius: '4px',
        transition: 'all 0.3s ease'
    },
    welcome: {
        color: '#2ecc71',
        fontWeight: 'bold',
        marginRight: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    adminBadge: {
        backgroundColor: '#9b59b6',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    addProductLink: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        transition: 'background-color 0.3s ease'
    },
    logoutBtn: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background-color 0.3s ease'
    },
    registerBtn: {
        backgroundColor: '#27ae60',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold'
    }
};