import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminPanel } from './pages/AdminPanel';
import { ClientPanel } from './pages/ClientPanel';
import { LandingPage } from './pages/LandingPage';

const AppRouter = () => {
  const { isAdmin } = useStore();
  const [view, setView] = useState<'landing' | 'booking'>('landing');

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (view === 'booking') {
    return <ClientPanel onBack={() => setView('landing')} />;
  }

  return <LandingPage onBook={() => setView('booking')} />;
};

const App = () => {
  return (
    <StoreProvider>
      <div className="antialiased text-gray-100 bg-gray-950 min-h-screen selection:bg-pink-500 selection:text-white">
        <AppRouter />
      </div>
    </StoreProvider>
  );
};

export default App;