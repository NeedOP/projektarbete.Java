import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!name.trim()) {
            setError('Product name is required');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            setError('Price must be greater than 0');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    price: parseFloat(price),
                    stock: stock ? parseInt(stock) : 0
                })
            });

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || 'Failed to add product');
            }

            setSuccess('✅ Product added successfully!');
            setName('');
            setDescription('');
            setPrice('');
            setStock('');

            // Redirect to products page after 2 seconds
            setTimeout(() => {
                navigate('/products');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>➕ Add New Product</h1>
                    <p style={styles.subtitle}>Fill in the product details</p>
                </div>

                {error && (
                    <div style={styles.errorMessage}>
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div style={styles.successMessage}>
                        ✅ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="name" style={styles.label}>
                            Product Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter product name"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="description" style={styles.label}>
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter product description"
                            rows={4}
                            style={styles.textarea}
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label htmlFor="price" style={styles.label}>
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0.01"
                                style={styles.input}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="stock" style={styles.label}>
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                id="stock"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                min="0"
                                style={styles.input}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div style={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            style={styles.cancelBtn}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            style={{
                                ...styles.submitBtn,
                                ...(loading ? styles.disabledBtn : {})
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Adding...
                                </>
                            ) : (
                                'Add Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 1rem'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
    },
    header: {
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
        color: '#27ae60',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #27ae60'
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
        border: '2px solid #bdc3c7',
        borderRadius: '10px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit'
    },
    textarea: {
        padding: '0.75rem 1rem',
        border: '2px solid #bdc3c7',
        borderRadius: '10px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        resize: 'vertical' as 'vertical',
        minHeight: '100px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem'
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #ecf0f1'
    },
    cancelBtn: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600' as '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    submitBtn: {
        padding: '0.75rem 2rem',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600' as '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    disabledBtn: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
        marginRight: '0.5rem'
    }
};