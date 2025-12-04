import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, saveProduct, checkAdmin } from '../api';

type ProductFormData = {
    name: string;
    description: string;
    price: string;
    stock: string;
};

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        stock: '0'
    });

    useEffect(() => {
        checkAdminStatus();
        if (id) {
            loadProduct();
        } else {
            setLoading(false);
        }
    }, [id]);

    async function checkAdminStatus() {
        try {
            const admin = await checkAdmin();
            setIsAdmin(admin);
            if (!admin) {
                navigate('/products');
            }
        } catch {
            navigate('/products');
        }
    }

    async function loadProduct() {
        try {
            setLoading(true);
            const product = await getProduct(parseInt(id!));
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                stock: product.stock.toString()
            });
        } catch (e: any) {
            setError('Error loading product: ' + e.message);
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim()) {
            setError('Product name is required');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Price must be greater than 0');
            return;
        }

        try {
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0
            };

            await saveProduct(productData, id ? parseInt(id) : undefined);

            setSuccess(id ? 'Product updated successfully!' : 'Product created successfully!');

            setTimeout(() => {
                navigate('/products');
            }, 2000);
        } catch (e: any) {
            setError('Error saving product: ' + e.message);
        }
    }

    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>
                    {id ? '✏️ Edit Product' : '➕ Add New Product'}
                </h1>

                {error && (
                    <div style={styles.errorMessage}>
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div style={styles.successMessage}>
                        ✅ {success} Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="name" style={styles.label}>Product Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="description" style={styles.label}>Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            rows={4}
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label htmlFor="price" style={styles.label}>Price ($) *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0.01"
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="stock" style={styles.label}>Stock Quantity</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            style={styles.submitBtn}
                        >
                            {id ? 'Update Product' : 'Create Product'}
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
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
    },
    title: {
        color: '#2c3e50',
        marginBottom: '2rem',
        fontSize: '2rem',
        textAlign: 'center' as 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
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
    textarea: {
        padding: '0.75rem 1rem',
        border: '2px solid #dfe6e9',
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
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '600' as '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)'
    },
    errorMessage: {
        backgroundColor: '#fdeded',
        color: '#5f2120',
        padding: '1rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #e74c3c',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    successMessage: {
        backgroundColor: '#edf7ed',
        color: '#1e4620',
        padding: '1rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #2ecc71',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    loading: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
    }
};