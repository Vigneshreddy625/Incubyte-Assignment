import React, { useState, useEffect } from 'react';
import { useSweet } from '../contexts/SweetContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import Notification from './Notification.jsx';
import AdminHeader from './Admin/Header.jsx';
import CreateSweetModal from './Modals/CreateSweetModal.jsx';
import EditSweetModal from './Modals/EditSweetModal.jsx';
import RestockSweetModal from './Modals/RestockSweetModal.jsx';
import DeleteSweetModal from './Modals/DeleteSweetModal.jsx';
import AdminOrders from './AdminOrders.jsx';
import {
  Package,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  ShoppingCart,
  Users
} from 'lucide-react';

const AdminPage = () => {
  const {
    sweets,
    pagination,
    isLoading,
    error,
    success,
    getAllSweets,
    createSweet,
    updateSweet,
    deleteSweet,
    restockSweet,
    clearMessages
  } = useSweet();

  const { user, logout } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('sweets');

  const loadSweets = async () => {
    await getAllSweets(currentPage, itemsPerPage);
  };

  const handleCreateSweet = async (sweetData) => {
    const result = await createSweet(sweetData);
    if (result.success) {
      setShowCreateModal(false);
      loadSweets();
    }
  };

  const handleEditSweet = async (sweetData) => {
    const result = await updateSweet(selectedSweet._id, sweetData);
    if (result.success) {
      setShowEditModal(false);
      setSelectedSweet(null);
      loadSweets();
    }
  };

  const handleDeleteSweet = async () => {
    const result = await deleteSweet(selectedSweet._id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedSweet(null);
      loadSweets();
    }
  };

  const handleRestockSweet = async (quantity) => {
    const result = await restockSweet(selectedSweet._id, quantity);
    if (result.success) {
      setShowRestockModal(false);
      setSelectedSweet(null);
      loadSweets();
    }
  };

  const openEditModal = (sweet) => {
    setSelectedSweet(sweet);
    setShowEditModal(true);
  };

  const openRestockModal = (sweet) => {
    setSelectedSweet(sweet);
    setShowRestockModal(true);
  };

  const openDeleteModal = (sweet) => {
    setSelectedSweet(sweet);
    setShowDeleteModal(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadSweets();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearMessages]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const addSweetButton = (
    <button
      onClick={() => setShowCreateModal(true)}
      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center sm:gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
    >
      <Plus className="w-5 h-5" />
      Add
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader logout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(error || success) && (
          <div className="mb-6">
            <Notification message={error || success} type={error ? 'error' : 'success'} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sweets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sweets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Sweets 
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Orders 
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'sweets' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sweets</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sweets.filter(sweet => sweet.quantity > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sweets.filter(sweet => sweet.quantity <= 10 && sweet.quantity > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sweets.filter(sweet => sweet.quantity === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-300">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
            <h2 className="text-md sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              Sweets Inventory
            </h2>
            {addSweetButton}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sweets.map((sweet) => (
                    <tr key={sweet._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{sweet.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{sweet.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">₹{sweet.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{sweet.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          sweet.quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : sweet.quantity <= 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {sweet.quantity === 0 ? 'Out of Stock' : sweet.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(sweet)}
                            className="cursor-pointer p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit Sweet"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRestockModal(sweet)}
                            className="cursor-pointer p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Restock Sweet"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(sweet)}
                            className="cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Sweet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, pagination.totalCount)}
                  </span> of <span className="font-medium">{pagination.totalCount}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label className="text-sm text-gray-700 mr-2">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'orders' && (
          <AdminOrders />
        )}
      </div>

      <CreateSweetModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSweet}
      />

      <EditSweetModal
        show={showEditModal}
        sweet={selectedSweet}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSweet}
      />

      <RestockSweetModal
        show={showRestockModal}
        sweet={selectedSweet}
        onClose={() => setShowRestockModal(false)}
        onSubmit={handleRestockSweet}
      />

      <DeleteSweetModal
        show={showDeleteModal}
        sweet={selectedSweet}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteSweet}
      />
    </div>
  );
};

export default AdminPage;