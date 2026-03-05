import { create } from 'zustand';
import { MenuItem } from '@/lib/firebase';

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    amountTotal: number;
    status: string;
    createdAt?: Date | any;
}

export interface Reservation {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    status: string;
}

interface AppState {
    isTransitioning: boolean;
    setIsTransitioning: (val: boolean) => void;

    // UI State
    isCartOpen: boolean;
    toggleCart: () => void;
    setCartOpen: (isOpen: boolean) => void;

    // Cart State
    cart: CartItem[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;

    // Computed (getters equivalent)
    getCartTotal: () => number;
    getCartCount: () => number;

    // Sync State
    menuItems: MenuItem[];
    forceClosed: boolean;
    orders: Order[];
    reservations: Reservation[];

    setMenuItems: (items: MenuItem[]) => void;
    setForceClosed: (isClosed: boolean) => void;
    setOrders: (orders: Order[]) => void;
    setReservations: (reservations: Reservation[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
    // Sync State
    menuItems: [],
    forceClosed: false,
    orders: [],
    reservations: [],
    setMenuItems: (items) => set({ menuItems: items }),
    setForceClosed: (isClosed) => set({ forceClosed: isClosed }),
    setOrders: (orders) => set({ orders }),
    setReservations: (reservations) => set({ reservations }),

    // Page Transition State
    isTransitioning: false,
    setIsTransitioning: (val) => set({ isTransitioning: val }),

    // UI State
    isCartOpen: false,
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

    // Cart State
    cart: [],
    addToCart: (item) => set((state) => {
        const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            return {
                cart: state.cart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
    }),

    removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== itemId)
    })),

    updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
            return { cart: state.cart.filter(item => item.id !== itemId) };
        }
        return {
            cart: state.cart.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        };
    }),

    clearCart: () => set({ cart: [] }),

    // Computed methods
    getCartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
    }
}));
