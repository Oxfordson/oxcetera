import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (product) => {
        const current = get().items;
        const exists = current.find((i) => i.id === product.id);
        if (exists) {
          set({
            items: current.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...current, { ...product, quantity: 1 }], isOpen: true });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, delta) => {
        set({
          items: get()
            .items.map((i) => {
              if (i.id === id) {
                const next = i.quantity + delta;
                return next > 0 ? { ...i, quantity: next } : null;
              }
              return i;
            })
            .filter(Boolean) as CartItem[],
        });
      },
      clearCart: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    { name: 'oxcetera-cart' }
  )
);