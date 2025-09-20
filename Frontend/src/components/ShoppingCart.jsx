import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useOrder } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import {
  ShoppingCart as CartIcon,
  Plus,
  Minus,
  Trash2,
  X,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";
import Notification from "./Notification";

const ShoppingCart = ({ isOpen, onClose }) => {
  const {
    items,
    totalAmount,
    totalItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const { createOrder, loading, error, clearError } = useOrder();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleQuantityChange = (sweetId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(sweetId);
    } else {
      updateQuantity(sweetId, newQuantity);
    }
  };

  const fetchLocationByPincode = async (pincode) => {
    if (pincode.length !== 6) return; // India pincode is 6 digits
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();
      if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setShippingAddress((prev) => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
          country: postOffice.Country,
        }));
      } else {
        setNotification({
          show: true,
          message: "Invalid PIN code",
          type: "error",
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to fetch location",
        type: "error",
      });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setNotification({
        show: true,
        message: "Please login to place an order",
        type: "error",
      });
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    try {
      // Validate shipping address
      const requiredFields = ["street", "city", "state", "zipCode"];
      for (const field of requiredFields) {
        if (!shippingAddress[field].trim()) {
          setNotification({
            show: true,
            message: `Please fill in ${field}`,
            type: "error",
          });
          return;
        }
      }

      // Prepare order data
      const orderData = {
        items: items.map((item) => ({
          sweetId: item.sweet._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: "cash_on_delivery",
        notes,
      };

      await createOrder(orderData);

      setNotification({
        show: true,
        message: "Order placed successfully!",
        type: "success",
      });

      // Clear cart and close modals
      clearCart();
      setShowCheckout(false);
      onClose();
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || "Failed to place order",
        type: "error",
      });
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <div
          className="fixed right-0 top-0 h-full w-full max-w-md sm:max-w-lg bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-slate-200">
              <div className="flex items-center justify-between p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <CartIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Shopping Cart
                    </h2>
                    <p className="text-sm text-slate-500">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Discover delicious sweets and add them to your cart!
                  </p>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.sweet._id}
                      className="group bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🍬</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {item.sweet.name}
                          </h4>
                          <p className="text-sm text-slate-500 capitalize">
                            {item.sweet.category}
                          </p>
                          <p className="text-lg font-bold text-indigo-600 mt-1">
                            ₹{item.sweet.price}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-slate-50 rounded-xl p-1">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.sweet._id,
                                  item.quantity - 1
                                )
                              }
                              className="p-2 hover:bg-white rounded-lg transition-colors duration-200 text-slate-600 hover:text-slate-900"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.sweet._id,
                                  item.quantity + 1
                                )
                              }
                              className="p-2 hover:bg-white rounded-lg transition-colors duration-200 text-slate-600 hover:text-slate-900"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.sweet._id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-700">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <CreditCard className="w-5 h-5" />
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Checkout
                  </h3>
                  <p className="text-slate-500 mt-1">
                    Complete your sweet order
                  </p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900">
                    Shipping Address
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => {
                        const pincode = e.target.value;
                        setShippingAddress((prev) => ({
                          ...prev,
                          zipCode: pincode,
                        }));
                        fetchLocationByPincode(pincode);
                      }}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white resize-none"
                    rows="2"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 mb-4">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-600" />
                  Order Summary
                </h4>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.sweet._id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <span className="text-slate-700 font-medium">
                          {item.sweet.name}
                        </span>
                        <span className="text-slate-500 text-sm ml-2">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        ₹{(item.sweet.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">
                        Total:
                      </span>
                      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </div>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <Notification
          show={notification.show}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {error && (
        <Notification
          show={true}
          message={error}
          type="error"
          onClose={clearError}
        />
      )}
    </>
  );
};

export default ShoppingCart;
