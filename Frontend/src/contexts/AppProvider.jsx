import { AuthProvider } from './AuthContext.jsx';
import { SweetProvider } from './SweetContext.jsx';
import { OrderProvider } from './OrderContext.jsx';
import { CartProvider } from './CartContext.jsx';

// Combined provider component that wraps both auth and sweet contexts
export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <SweetProvider>
        <OrderProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </OrderProvider>
      </SweetProvider>
    </AuthProvider>
  );
};

export default AppProvider;
