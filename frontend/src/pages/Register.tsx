import React, { useState } from 'react';
import { register, testConnection } from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const navigate = useNavigate();

    // Test backend connection first
    const testBackend = async () => {
        setTesting(true);
        setError('');
        setSuccess('');

        try {
            const result = await testConnection();
            if (result.ok) {
                setSuccess('✅ Backend is connected! You can register now.');
            } else {
                setError(`❌ Backend not reachable: ${result.error || 'Check if backend is running on port 8080'}`);
            }
        } catch (err: any) {
            setError(`❌ Cannot connect to backend: ${err.message}`);
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 3) {
            setError('Password must be at least 3 characters');
            return;
        }

        setLoading(true);

        try {
            console.log('🔄 Starting registration...');
            const result = await register(username, password);

            if (result.success) {
                setSuccess(`✅ ${result.message || 'Registration successful!'}`);

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Create Account 👤</h1>
                    <p style={styles.subtitle}>Join our e-commerce community</p>
                </div>

                <div style={styles.testSection}>
                    <button
                        onClick={testBackend}
                        disabled={testing}
                        style={styles.testButton}
                    >
                        {testing ? 'Testing...' : '🔍 Test Backend Connection'}
                    </button>

                    {success && success.includes('Backend') && (
                        <div style={styles.successMessage}>
                            {success}
                        </div>
                    )}
                </div>

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {success && !success.includes('Backend') && (
                    <div style={styles.successMessage}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>
                            Username *
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>
                            Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                        <small style={styles.helpText}>At least 3 characters</small>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="confirmPassword" style={styles.label}>
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.submitButton,
                            ...(loading ? styles.disabledButton : {})
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>
                                Registering...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.link}>
                            Sign in here
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
        maxWidth: '500px',
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
    testSection: {
        marginBottom: '1.5rem',
        textAlign: 'center' as 'center'
    },
    testButton: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginBottom: '1rem'
    },
    errorMessage: {
        backgroundColor: '#fdeded',
        color: '#e74c3c',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #e74c3c'
    },
    successMessage: {
        backgroundColor: '#edf7ed',
        color: '#2ecc71',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #2ecc71'
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
        fontFamily: 'inherit'
    },
    helpText: {
        color: '#95a5a6',
        fontSize: '0.85rem',
        marginTop: '0.25rem'
    },
    submitButton: {
        backgroundColor: '#2ecc71',
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
        marginTop: '1rem'
    },
    disabledButton: {
        opacity: 0.7,
        cursor: 'not-allowed'
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
        textDecoration: 'none'
    },
    homeLink: {
        color: '#95a5a6',
        fontSize: '0.9rem',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
    }
};