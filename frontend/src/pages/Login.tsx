import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(username, password);
            if (res.ok) {
                navigate('/products');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Welcome Back 👋</h1>
                    <p style={styles.subtitle}>Sign in to your account</p>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Don't have an account?{' '}
                        <Link to="/register" style={styles.link}>
                            Sign up here
                        </Link>
                    </p>
                    <Link to="/" style={styles.homeLink}>
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 70px)',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '3rem',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    },
    header: {
        textAlign: 'center' as 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2rem',
        color: '#2c3e50',
        marginBottom: '0.5rem'
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '1rem'
    },
    errorAlert: {
        backgroundColor: '#fdeded',
        color: '#5f2120',
        padding: '1rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #e74c3c'
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        gap: '1.5rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        gap: '0.5rem'
    },
    label: {
        fontWeight: '600' as '600',
        color: '#34495e',
        fontSize: '0.95rem'
    },
    input: {
        padding: '0.75rem 1rem',
        border: '2px solid #dfe6e9',
        borderRadius: '10px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        ':focus': {
            outline: 'none',
            borderColor: '#3498db',
            boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
        },
        ':disabled': {
            backgroundColor: '#f8f9fa',
            cursor: 'not-allowed'
        }
    },
    submitButton: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '1rem',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600' as '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '1rem',
        ':hover:not(:disabled)': {
            backgroundColor: '#2980b9',
            transform: 'translateY(-2px)'
        },
        ':disabled': {
            opacity: 0.7,
            cursor: 'not-allowed'
        }
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    footer: {
        marginTop: '2rem',
        textAlign: 'center' as 'center',
        paddingTop: '1.5rem',
        borderTop: '1px solid #ecf0f1'
    },
    footerText: {
        color: '#7f8c8d',
        fontSize: '0.95rem',
        marginBottom: '1rem'
    },
    link: {
        color: '#3498db',
        fontWeight: '600' as '600',
        textDecoration: 'none',
        ':hover': {
            textDecoration: 'underline'
        }
    },
    homeLink: {
        color: '#95a5a6',
        fontSize: '0.9rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        ':hover': {
            color: '#7f8c8d'
        }
    }

};