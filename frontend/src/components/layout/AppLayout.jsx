import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import FloatingAIChat from '../common/FloatingAIChat';
import './AppLayout.css';

const AppLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-layout__main">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} pageTitle={pageTitle} />
        <main className="app-layout__content">{children}</main>
      </div>
      <FloatingAIChat />
    </div>
  );
};

export default AppLayout;
