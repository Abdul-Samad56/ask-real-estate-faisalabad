import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyPage from './pages/PropertyPage';
import LoginPage from './pages/LoginPage';
import ListPropertyPage from './pages/ListPropertyPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="property/:id" element={<PropertyPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="list-property" element={<ListPropertyPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
