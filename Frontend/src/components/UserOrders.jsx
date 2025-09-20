import React, { useState, useEffect } from 'react';
import { useOrder } from '../contexts/OrderContext';
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

const UserOrders = () => {
  const { userOrders, loading, error, getUserOrders, cancelOrder, clearError } = useOrder();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      await getUserOrders(currentPage, 10, statusFilter || null);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(orderId);
        fetchOrders();
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      processing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      shipped: 'bg-purple-100 text-purple-700 border-purple-200',
      delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrder = (status) => {
    return ['pending', 'confirmed'].includes(status);
  };

  if (loading && userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-3">
              My Orders
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Track and manage all your sweet orders in one place
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <Notification
                type="error"
                message={error}
                onClose={clearError}
              />
            </div>
          )}

          {/* Filter Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 max-w-md">
                <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900"
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="text-sm text-slate-500">
                {userOrders.length} order{userOrders.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {userOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No orders found</h3>
            <p className="text-slate-600 text-lg max-w-md mx-auto">
              {statusFilter 
                ? 'No orders match your current filter. Try selecting a different status.' 
                : "You haven't placed any orders yet. Start shopping to see your orders here!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-900">
                          Order #{order.orderNumber}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}
                        >
                          <span>{getStatusIcon(order.status)}</span>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-2">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span className="text-slate-900 font-semibold text-lg">
                          ₹{order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="px-6 py-3 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        {expandedOrder === order._id ? '↑ Hide Details' : '↓ View Details'}
                      </button>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-6 py-3 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="border-t border-slate-200 bg-slate-50">
                    <div className="p-6 lg:p-8">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span>🧁</span>
                            Order Items
                          </h4>
                          <div className="space-y-4">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-sm transition-all duration-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-slate-900 mb-1">
                                      {item.sweet.name}
                                    </h5>
                                    <p className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-md inline-block">
                                      {item.sweet.category}
                                    </p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="font-semibold text-slate-900 mb-1">
                                      ₹{item.price.toFixed(2)} × {item.quantity}
                                    </p>
                                    <p className="text-sm font-bold text-blue-600">
                                      Total: ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span>📍</span>
                            Shipping Address
                          </h4>
                          <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <div className="space-y-2">
                              <p className="font-semibold text-slate-900 text-lg">
                                {order.shippingAddress.street}
                              </p>
                              <p className="text-slate-700">
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                              </p>
                              <p className="text-slate-700">
                                {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                              </p>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="mt-6">
                              <h5 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <span>💬</span>
                                Order Notes
                              </h5>
                              <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <p className="text-slate-700 italic">"{order.notes}"</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {userOrders.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                >
                  ← Previous
                </button>
                <div className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
                  Page {currentPage}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;