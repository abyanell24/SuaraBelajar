import React from 'react';
import { Outlet } from 'react-router-dom';

const Wave1Layout: React.FC = () => {
  return (
    <div data-testid="wave1-layout">
      <header data-testid="header" role="banner">
        <nav data-testid="nav" aria-label="Main navigation">
          <span data-testid="brand">SuaraBelajar</span>
        </nav>
      </header>
      <main data-testid="main-content" role="main">
        <Outlet />
      </main>
      <footer data-testid="footer" role="contentinfo">
        <span>SuaraBelajar Wave 1</span>
      </footer>
    </div>
  );
};

export default Wave1Layout;