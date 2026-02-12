import { createContext, useContext, useReducer, useState } from 'react';

const OrderContext = createContext();

const initialState = {
  restaurantId: null,
  tableNumber: null,
  cart: [],
  customerInfo: {
    name: '',
    phone: ''
  },
  order: null,
  orderId: null
};

const orderReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RESTAURANT':
      return {
        ...state,
        restaurantId: action.payload.restaurantId,
        tableNumber: action.payload.tableNumber
      };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }]
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };
    case 'SET_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: action.payload
      };
    case 'SET_ORDER':
      return {
        ...state,
        order: action.payload,
        orderId: action.payload.id
      };
    case 'RESET_ORDER':
      return initialState;
    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setRestaurant = (restaurantId, tableNumber) => {
    dispatch({ type: 'SET_RESTAURANT', payload: { restaurantId, tableNumber } });
  };

  const setCustomerInfo = (info) => {
    dispatch({ type: 'SET_CUSTOMER_INFO', payload: info });
  };

  const setOrder = (order) => {
    dispatch({ type: 'SET_ORDER', payload: order });
  };

  const resetOrder = () => {
    dispatch({ type: 'RESET_ORDER' });
  };

  const getTotalPrice = () => {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    ...state,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setRestaurant,
    setCustomerInfo,
    setOrder,
    resetOrder,
    getTotalPrice,
    getTotalItems,
    setLoading,
    setError
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
