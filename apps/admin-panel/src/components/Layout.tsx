import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <nav className="w-full bg-white dark:bg-gray-900 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img src="/servisline-logo.png" alt="ServisLine Logo" className="h-10 w-auto" />
            <div className="ml-8 flex space-x-8">
              <Link
                to="/"
                className={`${isActive('/') ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Gösterge Paneli
              </Link>
              <Link
                to="/services"
                className={`${isActive('/services') ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Servisler
              </Link>
              <Link
                to="/drivers"
                className={`${isActive('/drivers') ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Şoförler
              </Link>
              <Link
                to="/users"
                className={`${isActive('/users') ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Kullanıcılar
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-200">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-black dark:text-white bg-white dark:bg-gray-800 border border-black dark:border-gray-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white px-4 py-2 rounded-md shadow-sm transition-colors duration-200"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 w-full"><Outlet key={location.pathname} /></main>
    </div>
  );
}

export default Layout; 