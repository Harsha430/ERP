import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState } from 'react';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content with responsive margin based on sidebar width */}
      <div className="transition-all duration-300 ml-64" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <Header />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 p-6 overflow-auto min-h-[calc(100vh-80px)]"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}