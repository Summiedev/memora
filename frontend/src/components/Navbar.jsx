import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-shrink-0 text-white font-bold text-lg">
        <span className="chewy text-2xl bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent tracking-wide">
                Memora
              </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            <a href="#home" className="text-white font-medium hover:text-gray-300">
              Home
            </a>
            <a href="#dashboard" className="text-white font-medium hover:text-gray-300">
              Dashboard
            </a>
            <a href="#notifications" className="text-white font-medium hover:text-gray-300">
              Notifications
            </a>
            <button className="ml-4 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-500 transition">
            <a href="/login" className="text-white font-medium hover:text-gray-300">
            Login
            </a> 
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isOpen ? "block" : "hidden"} sm:hidden`} id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="#home"
              className="block px-3 py-2 rounded-md text-white text-base font-medium hover:bg-gray-700"
            >
              Home
            </a>
            <a
              href="#dashboard"
              className="block px-3 py-2 rounded-md text-white text-base font-medium hover:bg-gray-700"
            >
              Features
            </a>
            <a
              href="#notifications"
              className="block px-3 py-2 rounded-md text-white text-base font-medium hover:bg-gray-700"
            >
              Contact
            </a>
            <button className="w-full text-left px-3 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-500">
              Login
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-500">
              Signup
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
