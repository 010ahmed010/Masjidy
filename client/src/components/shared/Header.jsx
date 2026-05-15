import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settings, setSettings] = useState({ registrationOpen: true, siteName: 'مسجدي' });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    axios.get('/api/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/attendance', label: 'الغياب والحضور' },
    { to: '/contact', label: 'تواصل معنا' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
              <i className="fas fa-mosque text-white text-lg"></i>
            </div>
            <span className="text-2xl font-bold text-primary-800">{settings.siteName || 'مسجدي'}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-semibold transition-colors text-sm ${isActive(link.to) ? 'text-primary-700 border-b-2 border-primary-700' : 'text-gray-600 hover:text-primary-700'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {settings.registrationOpen && !user && (
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                <i className="fas fa-circle text-green-500 ml-1 text-[8px]"></i>
                التسجيل مفتوح
              </span>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center">
                    <i className={`fas ${user.role === 'admin' ? 'fa-user-shield' : 'fa-chalkboard-teacher'} text-white text-xs`}></i>
                  </div>
                  <span>{user.name || user.username}</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">مسجّل كـ</p>
                      <p className="font-bold text-primary-800 text-sm">{user.name}</p>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">
                        {user.role === 'admin' ? 'مدير' : 'معلم'}
                      </span>
                    </div>
                    <Link
                      to={user.role === 'admin' ? '/admin' : '/teacher'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <i className="fas fa-tachometer-alt text-primary-600 w-4"></i>
                      لوحة التحكم
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <i className="fas fa-sign-out-alt w-4"></i>
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-800 transition-colors">
                <i className="fas fa-sign-in-alt ml-1"></i>
                تسجيل الدخول
              </Link>
            )}
          </div>

          <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t pt-3 flex flex-col gap-3">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-gray-700 font-semibold hover:text-primary-700" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1 bg-primary-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center">
                    <i className={`fas ${user.role === 'admin' ? 'fa-user-shield' : 'fa-chalkboard-teacher'} text-white text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-bold text-primary-800 text-sm">{user.name}</p>
                    <p className="text-xs text-primary-600">{user.role === 'admin' ? 'مدير' : 'معلم'}</p>
                  </div>
                </div>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/teacher'}
                  className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="fas fa-tachometer-alt ml-1"></i>
                  لوحة التحكم
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold text-center"
                >
                  <i className="fas fa-sign-out-alt ml-1"></i>
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center" onClick={() => setMenuOpen(false)}>
                تسجيل الدخول
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
