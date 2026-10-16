import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/api';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  ShoppingBag,
  Store,
  Truck,
  PackageOpen,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AddressResponseDto {
  addressId: number;
  city: string;
  postalCode: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string | null;
}

type OrderType = 0 | 1 | 2;
type PaymentState = "idle" | "processing" | "success" | "error";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(1);

  const [addresses, setAddresses] = useState<AddressResponseDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | "new" | null
  >(null);
  const [newAddress, setNewAddress] = useState({
    city: "",
    postalCode: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
  });

  const [customerNotes, setCustomerNotes] = useState("");
  const [tableNumber, setTableNumber] = useState<number | "">("");

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchAddresses();
    }

    return () => stopPolling();
  }, [navigate, token]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Clients/me/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].addressId);
        } else {
          setSelectedAddressId("new");
        }
      }
    } catch (error) {
      console.error("Błąd pobierania adresów:", error);
    }
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPollingOrderStatus = (id: number) => {
    stopPolling();

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/Orders/${id}/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const order = await response.json();

          if (order.isPaid === true) {
            setPaymentState("success");
            clearCart();
            stopPolling();
          } else if (order.status === "Anulowane") {
            setPaymentState("error");
            stopPolling();
          }
        }
      } catch (error) {
        console.error("Błąd podczas sprawdzania statusu:", error);
      }
    }, 3000);
  };

  const handleRetryPayment = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
      setPaymentState("processing");
      if (orderId) {
        startPollingOrderStatus(orderId);
      }
    } else {
      alert("Nie udało się przywrócić linku do płatności.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const paymentWindow = window.open("", "_blank");

    try {
      let finalAddressId = selectedAddressId;

      if (orderType === 1 && selectedAddressId === "new") {
        const addressPayload = {
          city: newAddress.city,
          postalCode: newAddress.postalCode,
          street: newAddress.street,
          buildingNumber: newAddress.buildingNumber,
          apartmentNumber:
            newAddress.apartmentNumber.trim() !== ""
              ? newAddress.apartmentNumber
              : null,
        };

        const addressRes = await fetch(
          `${API_BASE_URL}/Clients/me/addresses`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addressPayload),
          },
        );

        if (addressRes.ok) {
          const createdAddress = await addressRes.json();
          finalAddressId = createdAddress.addressId;
        } else {
          const errorText = await addressRes.text();
          alert(
            `Błąd zapisu nowego adresu. Sprawdź format danych.\n${errorText}`,
          );
          setIsLoading(false);
          if (paymentWindow) paymentWindow.close();
          return;
        }
      }

      const getOrderTypeString = (type: number) => {
        if (type === 0) return "NaMiejscu";
        if (type === 1) return "Dostawa";
        if (type === 2) return "NaWynos";
        return "Dostawa";
      };

      const orderPayload = {
        orderType: getOrderTypeString(orderType),
        customerNotes: customerNotes.trim() !== "" ? customerNotes : null,
        tableNumber:
          orderType === 0 && tableNumber !== "" ? Number(tableNumber) : null,
        addressId: orderType === 1 ? finalAddressId : null,
        orderItems: items.map((item) => ({
          dishId: item.id,
          quantity: item.quantity,
        })),
      };

      const orderRes = await fetch(`${API_BASE_URL}/Orders/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        const link =
          orderData.paymentUrl || orderData.payUUrl || orderData.redirectUri;

        if (link) {
          if (paymentWindow) paymentWindow.location.href = link;

          setOrderId(orderData.orderId);
          setPaymentUrl(link);
          setPaymentState("processing");
          startPollingOrderStatus(orderData.orderId);
        } else {
          if (paymentWindow) paymentWindow.close();
          clearCart();
          alert("Pomyślnie złożono zamówienie!");
          navigate("/profile");
        }
      } else {
        if (paymentWindow) paymentWindow.close();
        const errorText = await orderRes.text();
        let readableError = errorText || `Status HTTP: ${orderRes.status}`;

        if (orderRes.status === 403) {
          readableError =
            "Odmowa dostępu (403)! Ten endpoint jest tylko dla Klientów.";
        } else {
          try {
            const jsonError = JSON.parse(errorText);
            if (jsonError.errors) {
              readableError = JSON.stringify(jsonError.errors, null, 2);
            } else if (jsonError.title) {
              readableError = jsonError.title;
            } else if (jsonError.message) {
              readableError = jsonError.message;
            }
          } catch {
            // Zostawiamy oryginalny tekst
          }
        }
        alert(`Odrzucono zamówienie:\n${readableError}`);
      }
    } catch (error) {
      console.error("Błąd Checkoutu:", error);
      if (paymentWindow) paymentWindow.close();
      alert("CRITICAL ERROR: Nie udało się połączyć z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentState === "processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-lg w-full text-center border border-gray-100 dark:border-slate-700">
          <Loader2 className="w-20 h-20 text-blue-500 animate-spin mb-6" />
          <h2 className="text-3xl font-black mb-4 dark:text-white">
            Oczekujemy na płatność
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
            Zakończ proces płatności w nowo otwartej karcie.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Ta strona odświeży się automatycznie, gdy system zarejestruje
            wpłatę.
          </p>
        </div>
      </div>
    );
  }

  if (paymentState === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-lg w-full text-center border border-gray-100 dark:border-slate-700">
          <XCircle className="w-20 h-20 text-red-500 mb-6" />
          <h2 className="text-3xl font-black text-red-500 mb-4">
            Płatność odrzucona
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Coś poszło nie tak podczas przetwarzania Twojej płatności lub
            transakcja została anulowana.
          </p>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white py-4 rounded-xl font-bold transition-all active:scale-95"
            >
              Przerwij
            </button>
            <button
              onClick={handleRetryPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/30"
            >
              Ponów próbę
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentState === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-lg w-full text-center border border-gray-100 dark:border-slate-700">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6 animate-bounce" />
          <h2 className="text-3xl font-black text-green-500 mb-4">
            Płatność pomyślna!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Zaczęliśmy już przygotowywać Twoje zamówienie. Będzie pysznie!
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-500/30"
          >
            Zobacz swoje zamówienia
          </button>
        </div>
      </div>
    );
  }

  // ----- STANDARDOWY EKRAN CHECKOUTU -----

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 text-center px-4 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full border border-gray-100 dark:border-slate-700">
          <ShoppingBag
            size={80}
            className="text-gray-300 dark:text-slate-600 mb-6"
          />
          <h2 className="text-3xl font-black mb-2 dark:text-white">
            Koszyk jest pusty!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            Musisz coś dodać, żeby zapłacić.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-blue-500/30"
          >
            Wróć do menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-10 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Wróć do zakupów
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-black mb-8 dark:text-white">
              Szczegóły Zamówienia
            </h2>

            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6"
            >
              {/* TYP ZAMÓWIENIA */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => setOrderType(0)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold transition-all border-2 ${orderType === 0 ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400" : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800"}`}
                >
                  <Store size={24} className="mb-2" />
                  <span className="text-sm">Na miejscu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType(2)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold transition-all border-2 ${orderType === 2 ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400" : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800"}`}
                >
                  <PackageOpen size={24} className="mb-2" />
                  <span className="text-sm">Na wynos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType(1)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold transition-all border-2 ${orderType === 1 ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400" : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800"}`}
                >
                  <Truck size={24} className="mb-2" />
                  <span className="text-sm">Dostawa</span>
                </button>
              </div>

              {/* SEKCJA: NA MIEJSCU (Numer stolika) */}
              {orderType === 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Numer stolika *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tableNumber}
                    onChange={(e) =>
                      setTableNumber(parseInt(e.target.value) || "")
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all"
                    placeholder="Wpisz numer stolika..."
                  />
                </div>
              )}

              {/* SEKCJA: DOSTAWA */}
              {orderType === 1 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="text-blue-500" /> Gdzie dostarczyć?
                  </h3>

                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <label
                          key={addr.addressId}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.addressId ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600"}`}
                        >
                          <input
                            type="radio"
                            name="addressSelect"
                            checked={selectedAddressId === addr.addressId}
                            onChange={() =>
                              setSelectedAddressId(addr.addressId)
                            }
                            className="w-5 h-5 text-blue-600"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {addr.street} {addr.buildingNumber}
                              {addr.apartmentNumber &&
                                ` / ${addr.apartmentNumber}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {addr.postalCode} {addr.city}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all mb-4 ${selectedAddressId === "new" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600"}`}
                  >
                    <input
                      type="radio"
                      name="addressSelect"
                      checked={selectedAddressId === "new"}
                      onChange={() => setSelectedAddressId("new")}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-bold text-blue-600 flex items-center gap-2">
                      <Plus size={18} /> Dodaj nowy adres
                    </span>
                  </label>

                  {selectedAddressId === "new" && (
                    <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-200 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Miasto *
                        </label>
                        <input
                          required
                          type="text"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Kod pocztowy *
                        </label>
                        <input
                          required
                          type="text"
                          value={newAddress.postalCode}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Ulica *
                        </label>
                        <input
                          required
                          type="text"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              street: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Nr budynku *
                        </label>
                        <input
                          required
                          type="text"
                          value={newAddress.buildingNumber}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              buildingNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                          Nr lokalu
                        </label>
                        <input
                          type="text"
                          value={newAddress.apartmentNumber}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              apartmentNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* UWAGI */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mt-4">
                  Uwagi do zamówienia (opcjonalnie)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all"
                  placeholder="np. Bez cebuli..."
                />
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  (orderType === 1 && !selectedAddressId) ||
                  (orderType === 0 && !tableNumber)
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-700 text-white py-5 rounded-2xl font-black text-xl transition-all active:scale-95 flex justify-center items-center gap-3 mt-8 shadow-xl shadow-blue-500/30 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" /> PRZETWARZANIE...
                  </>
                ) : (
                  <>
                    <CreditCard size={24} /> ZAMAWIAM I PŁACĘ (
                    {totalPrice.toFixed(2)} zł)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* PRAWA STRONA - PODSUMOWANIE */}
          <div>
            <h2 className="text-3xl font-black mb-8 dark:text-white">
              Podsumowanie
            </h2>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 sticky top-24">
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700"
                  >
                    <div>
                      <span className="font-bold dark:text-white block">
                        {item.name}
                      </span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Ilość: {item.quantity}
                      </span>
                    </div>
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {(item.price * item.quantity).toFixed(2)} zł
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-gray-200 dark:border-slate-700 pt-6 flex justify-between items-end">
                <span className="text-xl text-gray-500 dark:text-gray-400 font-bold">
                  Do zapłaty:
                </span>
                <span className="text-5xl font-black text-blue-600 dark:text-blue-400">
                  {totalPrice.toFixed(2)} zł
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;