import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, addToCart, decrementQuantity, totalPrice } = useCart();
    const navigate = useNavigate();
    const { t } = useTranslation();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-800 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
            <h2 className="text-xl font-black flex items-center gap-2 dark:text-white">
                          <ShoppingBag className="text-blue-500" /> {t("cart.title")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition dark:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center mt-20 text-gray-400">
                <ShoppingBag size={64} className="mx-auto mb-4 opacity-20" />
                              <p>{t("cart.empty")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-gray-100 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <p className="font-bold dark:text-white leading-tight">
                        {item.name}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-black mt-1">
                        {(item.price * item.quantity).toFixed(2)} zł
                      </p>
                    </div>

                    {/* --- KONTROLER ILOŚCI --- */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 rounded-lg transition"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="font-black text-slate-900 dark:text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => addToCart(item)} // Reużywamy addToCart, bo on dodaje +1
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-500 rounded-lg transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex justify-between text-lg font-bold mb-4 dark:text-white">
                          <span>{t("cart.total")}</span>
              <span className="text-blue-600 dark:text-blue-400">
                {totalPrice.toFixed(2)} zł
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
              disabled={items.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:shadow-none text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 transition active:scale-95"
            >
                          {t("cart.checkout")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
