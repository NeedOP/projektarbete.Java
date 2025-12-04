import React, { useState } from 'react';
import { createOrder } from '../api';
import { useNavigate } from 'react-router-dom';

type CartItem = {
    productId: number;
    name: string;
    price: number;
    quantity: number;
};

export default function Cart() {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function updateCart(newCart: CartItem[]) {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    }

    function removeItem(index: number) {
        const newCart = [...cart];
        newCart.splice(index, 1);
        updateCart(newCart);
    }

    function updateQuantity(index: number, change: number) {
        const newCart = [...cart];
        newCart[index].quantity += change;

        if (newCart[index].quantity <= 0) {
            newCart.splice(index, 1);
        }

        updateCart(newCart);
    }

    async function checkout() {
        if (cart.length === 0) {
            setMessage('Cart is empty');
            return;
        }

        setLoading(true);
        try {
            const items = cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }));

            await createOrder(items);
            setMessage('Order placed successfully!');
            localStorage.removeItem('cart');
            setCart([]);
            setTimeout(() => navigate('/products'), 2000);
        } catch (e: any) {
            setMessage('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div style={{padding: 20}}>
            <h2>Shopping Cart</h2>

            {cart.length === 0 ? (
                <div>Your cart is empty</div>
            ) : (
                <>
                    <div style={{marginBottom: '20px'}}>
                        {cart.map((item, index) => (
                            <div key={index} style={{
                                border: '1px solid #ddd',
                                padding: '15px',
                                marginBottom: '10px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{margin: 0}}>{item.name}</h4>
                                    <p style={{margin: '5px 0'}}>Price: ${item.price.toFixed(2)}</p>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <button
                                        onClick={() => updateQuantity(index, -1)}
                                        style={{padding: '5px 10px'}}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(index, 1)}
                                        style={{padding: '5px 10px'}}
                                    >
                                        +
                                    </button>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    <button
                                        onClick={() => removeItem(index)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        borderTop: '2px solid #333',
                        paddingTop: '15px',
                        marginBottom: '20px'
                    }}>
                        <h3>Total: ${total.toFixed(2)}</h3>
                    </div>

                    <button
                        onClick={checkout}
                        disabled={loading || cart.length === 0}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: loading ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : 'Checkout'}
                    </button>
                </>
            )}

            {message && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
                    color: message.includes('successfully') ? '#155724' : '#721c24',
                    borderRadius: '4px'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}