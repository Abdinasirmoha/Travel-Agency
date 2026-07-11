import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('elite_customer');
    if (storedUser) {
      try {
        setCustomer(JSON.parse(storedUser));
      } catch (err) {
        sessionStorage.removeItem('elite_customer');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    sessionStorage.setItem('elite_customer', JSON.stringify(userData));
    setCustomer(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('elite_customer');
    setCustomer(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-navy-900">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ customer, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useCustomer = () => useContext(AuthContext);
