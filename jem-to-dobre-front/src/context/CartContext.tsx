import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
interface CartContextType {
  items: CartItem[];
  addToCart: (dish: { id: number; name: string; price: number }) => void;
  decrementQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalPrice: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const addToCart = (dish: { id: number; name: string; price: number }) => {
    setItems((prev) => {
      const existing = prev.find((items) => items.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };
  const decrementQuantity = (id: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        );
      }
      return prev.filter((item) => item.id !== id);
    });
  };
  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  const clearCart = () => setItems([]);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        decrementQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
