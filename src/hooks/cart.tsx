import React, {
	createContext,
	useState,
	useCallback,
	useContext,
	useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
	id: string;
	title: string;
	image_url: string;
	price: number;
	quantity: number;
}

interface CartContext {
	products: Product[];
	addToCart(item: Omit<Product, 'quantity'>): void;
	increment(id: string): void;
	decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
	const [products, setProducts] = useState<Product[]>([]);

	useEffect(() => {
		async function loadProducts(): Promise<void> {
			const data = await AsyncStorage.getItem('desafio08:products');
			if (data) setProducts(JSON.parse(data));
		}
		loadProducts();
	}, []);

	const addToCart = useCallback(async (product:Product) => {
		const index = products.findIndex(p => p.id == product.id);
		if (index >= 0) {
			increment(product.id);
		} else {
			product.quantity = 1;
			setProducts([...products, product]);
			await AsyncStorage.setItem('desafio08:products',JSON.stringify(products));
		}
	}, [products]);

	const increment = useCallback(async id => {
		const products2 = [...products];
		const index = products.findIndex(p => p.id == id);
		if (index < 0) return;
		products2[index].quantity++;
		setProducts(products2);
		await AsyncStorage.setItem('desafio08:products',JSON.stringify(products));
	}, [products]);

	const decrement = useCallback(async id => {
		const products2 = [...products];
		const index = products2.findIndex(p => p.id == id);
		if (index < 0) return;
		products2[index].quantity--;
		const newqty = products2[index].quantity;
		if (newqty <= 0) {
			products2.splice(index,1);
		}
		setProducts(products2);
		await AsyncStorage.setItem('desafio08:products',JSON.stringify(products));
	}, [products]);

	const value = React.useMemo(
		() => ({ addToCart, increment, decrement, products }),
		[products, addToCart, increment, decrement],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
	const context = useContext(CartContext);

	if (!context) {
		throw new Error(`useCart must be used within a CartProvider`);
	}

	return context;
}

export { CartProvider, useCart };
