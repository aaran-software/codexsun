import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/global/auth/AuthContext';
import { Menu, X, ArrowUp, Sun, Moon } from 'lucide-react';
import Loader from "@/components/loader/loader";

interface WebLayoutProps {
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const WebLayout: React.FC<WebLayoutProps> = ({ onLoginClick, onLogoutClick }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme
      ? savedTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, [user]);

  const handleDashboardClick = () => {
    navigate(user ? '/dashboard' : '/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <nav className="bg-primary text-primary-foreground shadow-sm sticky top-0 z-50">
        <div className="pl-6 sm:pl-36 mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold tracking-wider">Codexsun</div>
            <div className="flex items-center space-x-4">
              <button
                className="sm:hidden p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
            <ul className="hidden sm:flex items-center space-x-6">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/10 text-primary-foreground underline'
                        : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/10 text-primary-foreground underline'
                        : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`
                  }
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/10 text-primary-foreground underline'
                        : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`
                  }
                >
                  Contact
                </NavLink>
              </li>
              {user ? (
                <>
                  <li>
                    <button
                      onClick={handleDashboardClick}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors focus:outline-none disabled:opacity-50"
                      disabled={loading}
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onLogoutClick}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors focus:outline-none disabled:opacity-50"
                      disabled={loading}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={onLoginClick}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors focus:outline-none disabled:opacity-50"
                    disabled={loading}
                  >
                    Login
                  </button>
                </li>
              )}
              <li>
                <button
                  className="p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </li>
            </ul>
          </div>
          {isMenuOpen && (
            <ul className="sm:hidden mt-4 flex flex-col space-y-2">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/10 text-primary-foreground'
                        : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/10 text-primary-foreground'
                        : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-foreground/10 text-primary-foreground'
                        : 'hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </NavLink>
              </li>
              {user ? (
                <>
                  <li>
                    <button
                      onClick={handleDashboardClick}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors focus:outline-none disabled:opacity-50"
                      disabled={loading}
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onLogoutClick}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors focus:outline-none disabled:opacity-50"
                      disabled={loading}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={onLoginClick}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors focus:outline-none disabled:opacity-50"
                    disabled={loading}
                  >
                    Login
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={toggleTheme}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors focus:outline-none"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </li>
            </ul>
          )}
        </div>
      </nav>
      <main className="flex-grow mx-auto w-full">
        <Outlet />
      </main>
      <footer className="bg-primary text-primary-foreground py-4">
        <div className="mx-auto px-4 flex justify-between items-center text-sm">
          <div>&copy; {new Date().getFullYear()} Codexsun. All rights reserved.</div>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors focus:outline-none"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default WebLayout;