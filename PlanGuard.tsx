import React from 'react';
import { useStore } from '../context/StoreContext';
import { Lock } from 'lucide-react';

export const PlanGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, activatePlan, isAdmin } = useStore();

  // If plan is active or we are not in admin mode (optional logic, but per requirements plan blocks everything if inactive)
  // Re-reading requirements: "Quando plano está inativo: todas as funcionalidades devem ficar bloqueadas".
  // Assuming this wraps the entire Admin Panel.

  if (config.planActive) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Blurred Content */}
      <div className="absolute inset-0 filter blur-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/80">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gold-500/30 text-center max-w-md mx-4">
          <div className="mx-auto bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Plano Inativo</h2>
          <p className="text-gray-400 mb-8">
            Para gerenciar sua agenda, profissionais e configurações, é necessário ativar sua assinatura.
          </p>
          
          <button
            onClick={activatePlan}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 hover:brightness-110"
            style={{
              background: `linear-gradient(to right, ${config.colors.primary}, ${config.colors.secondary})`,
              color: '#111827' // Dark text for contrast on gold
            }}
          >
            Ativar Plano – R$ 45,30
          </button>
          <p className="mt-4 text-xs text-gray-500">Cobrança única mensal. Cancele quando quiser.</p>
        </div>
      </div>
    </div>
  );
};