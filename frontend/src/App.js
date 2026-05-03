import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import PublishItem from './pages/PublishItem';
import MyItems from './pages/MyItems';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import AdminCategories from './pages/admin/Categories';
import AdminItems from './pages/admin/Items';
import AdminUsers from './pages/admin/Users';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/current-user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <AdminRoutes />
        } />
        <Route path="*" element={
          <div>
            <Header user={user} onLogout={handleLogout} />
            <MainRoutes user={user} onLogin={handleLogin} />
          </div>
        } />
      </Routes>
    </Router>
  );
}

function AdminRoutes() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get('/api/admin/items', { withCredentials: true });
        setIsAdmin(true);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="items" element={<AdminItems />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

function MainRoutes({ user, onLogin }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <Login onLogin={onLogin} />
      } />
      <Route path="/register" element={
        user ? <Navigate to="/" replace /> : <Register onLogin={onLogin} />
      } />
      <Route path="/item/:id" element={<ItemDetail user={user} />} />
      <Route path="/publish" element={
        user ? <PublishItem user={user} /> : <Navigate to="/login" replace />
      } />
      <Route path="/my-items" element={
        user ? <MyItems user={user} /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

export default App;
