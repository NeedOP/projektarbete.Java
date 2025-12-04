import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <h1 style={styles.title}>Welcome to E-Shop 🛍️</h1>
                <p style={styles.subtitle}>Your one-stop shop for everything!</p>

                <div style={styles.ctaButtons}>
                    <Link to="/products" style={styles.ctaPrimary}>
                        Browse Products
                    </Link>
                    <Link to="/register" style={styles.ctaSecondary}>
                        Create Account
                    </Link>
                </div>
            </div>

            <div style={styles.features}>
                <div style={styles.feature}>
                    <div style={styles.featureIcon}>🚚</div>
                    <h3>Free Shipping</h3>
                    <p>On orders over $50</p>
                </div>
                <div style={styles.feature}>
                    <div style={styles.featureIcon}>🔒</div>
                    <h3>Secure Payment</h3>
                    <p>100% secure transactions</p>
                </div>
                <div style={styles.feature}>
                    <div style={styles.featureIcon}>↩️</div>
                    <h3>Easy Returns</h3>
                    <p>30-day return policy</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
    },
    hero: {
        textAlign: 'center' as 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        color: 'white',
        marginBottom: '3rem'
    },
    title: {
        fontSize: '3rem',
        marginBottom: '1rem'
    },
    subtitle: {
        fontSize: '1.2rem',
        opacity: 0.9,
        marginBottom: '2rem'
    },
    ctaButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap' as 'wrap'
    },
    ctaPrimary: {
        backgroundColor: '#2ecc71',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        transition: 'transform 0.3s ease',
        ':hover': {
            transform: 'translateY(-3px)'
        }
    },
    ctaSecondary: {
        backgroundColor: 'transparent',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        border: '2px solid white',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: 'white',
            color: '#764ba2'
        }
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
    },
    feature: {
        textAlign: 'center' as 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease',
        ':hover': {
            transform: 'translateY(-10px)'
        }
    },
    featureIcon: {
        fontSize: '3rem',
        marginBottom: '1rem'
    }
};