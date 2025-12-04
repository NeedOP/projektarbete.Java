import React, { useEffect, useState } from 'react';
import { listProducts, deleteProduct, checkAdmin } from '../api';
import { Link, useNavigate } from 'react-router-dom';

type Product = {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
};

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
        checkAdminStatus();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            const data = await listProducts();
            setProducts(data);
            setError('');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function checkAdminStatus() {
        try {
            const admin = await checkAdmin();
            setIsAdmin(admin);
        } catch {
            setIsAdmin(false);
        }
    }

    async function handleDelete(id: number) {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (e: any) {
                alert('Error deleting product: ' + e.message);
            }
        }
    }

    function addToCart(product: Product) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((c: any) => c.productId === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                quantity: 1,
                name: product.name,
                price: product.price,
                description: product.description
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`✅ Added ${product.name} to cart!`);
    }

    if (loading) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Our Products</h1>

                {isAdmin && (
                    <Link to="/admin/add-product" className="add-product-btn">
                        <span>+</span> Add New Product
                    </Link>
                )}
            </div>

            {error && <div style={styles.errorMessage}>{error}</div>}

            {products.length === 0 && !error ? (
                <div style={styles.noProducts}>
                    <p>No products available.</p>
                    {isAdmin && (
                        <Link to="/admin/add-product" style={styles.addFirstProduct}>
                            Add your first product
                        </Link>
                    )}
                </div>
            ) : (
                <div style={styles.productsGrid}>
                    {products.map(product => (
                        <div key={product.id} style={styles.productCard}>
                            {isAdmin && (
                                <div style={styles.adminControls}>
                                    <button
                                        onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                                        style={styles.editBtn}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        style={styles.deleteBtn}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            )}

                            <div style={styles.productImage}>
                                <div style={styles.imagePlaceholder}>
                                    {product.name.charAt(0)}
                                </div>
                            </div>

                            <div style={styles.productInfo}>
                                <h3 style={styles.productName}>{product.name}</h3>
                                <p style={styles.productDescription}>{product.description || 'No description'}</p>

                                <div style={styles.productDetails}>
                                    <span style={styles.productPrice}>${product.price.toFixed(2)}</span>
                                    <span style={{
                                        ...styles.productStock,
                                        ...(product.stock > 0 ? styles.inStock : styles.outOfStock)
                                    }}>
                                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.productActions}>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                    style={{
                                        ...styles.addToCartBtn,
                                        ...(product.stock === 0 ? styles.disabledBtn : {})
                                    }}
                                >
                                    {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                                </button>

                                {product.stock <= 10 && product.stock > 0 && (
                                    <span style={styles.lowStock}>Low stock!</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap' as 'wrap',
        gap: '1rem'
    },
    title: {
        fontSize: '2.5rem',
        color: '#2c3e50',
        margin: 0
    },
    addProductBtn: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
    },
    errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '1rem',
        borderRadius: '8px',
        margin: '1rem 0',
        border: '1px solid #f5c6cb'
    },
    noProducts: {
        textAlign: 'center' as 'center',
        padding: '4rem',
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    addFirstProduct: {
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
    },
    productCard: {
        background: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        position: 'relative' as 'relative',
        border: '1px solid #e0e0e0'
    },
    adminControls: {
        position: 'absolute' as 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        gap: '0.5rem',
        zIndex: 10
    },
    editBtn: {
        padding: '0.25rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#3498db',
        color: 'white'
    },
    deleteBtn: {
        padding: '0.25rem 0.75rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#e74c3c',
        color: 'white'
    },
    productImage: {
        height: '180px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagePlaceholder: {
        width: '100px',
        height: '100px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '3rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    productInfo: {
        padding: '1.5rem'
    },
    productName: {
        margin: '0 0 0.5rem 0',
        color: '#2c3e50',
        fontSize: '1.25rem'
    },
    productDescription: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        lineHeight: 1.4,
        minHeight: '2.8rem'
    },
    productDetails: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    productPrice: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    productStock: {
        fontSize: '0.9rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontWeight: 'bold'
    },
    inStock: {
        backgroundColor: '#d4edda',
        color: '#155724'
    },
    outOfStock: {
        backgroundColor: '#f8d7da',
        color: '#721c24'
    },
    productActions: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e0e0e0'
    },
    addToCartBtn: {
        width: '100%',
        padding: '0.75rem',
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    },
    disabledBtn: {
        background: '#95a5a6',
        cursor: 'not-allowed',
        opacity: 0.7
    },
    lowStock: {
        display: 'block',
        textAlign: 'center' as 'center',
        color: '#e74c3c',
        fontSize: '0.8rem',
        marginTop: '0.5rem',
        fontWeight: 'bold',
        animation: 'pulse 2s infinite'
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