import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, X } from 'lucide-react';

function NavLink({ href, label, onClick }) {
  const router = useRouter();
  const isActive = router.pathname === href;
  return (
    <a
      href={href}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg font-medium text-base transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
      style={{ textDecoration: 'none' }}
    >
      {label}
    </a>
  );
}

export default function Navbar() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/trip-json-editor', label: 'Trip JSON' },
    { href: '/general-note', label: 'General Note' },
  ];
  const [navOpen, setNavOpen] = useState(false);
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 tracking-tight select-none">Trip Planner</span>
        </div>
        <div className="hidden md:flex gap-2 items-center">
          {navLinks.map(link => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
          aria-label="Open menu"
          onClick={() => setNavOpen(v => !v)}
        >
          {navOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div
        className={`md:hidden bg-white border-t border-gray-100 shadow-sm flex flex-col px-4 pb-3 transition-all duration-300 ${navOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        {navLinks.map(link => (
          <NavLink key={link.href} href={link.href} label={link.label} onClick={() => setNavOpen(false)} />
        ))}
      </div>
    </nav>
  );
}
