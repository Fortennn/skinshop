import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#030508] text-gray-100 overflow-x-hidden">
      {/* Premium Visual Depth: Ambient Radial Light Leaks */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-accent-cyan/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-accent-purple/5 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 left-1/4 w-[300px] h-[300px] bg-accent-pink/[0.02] rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Cyber Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.006)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.006)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      <Header />
      
      <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
