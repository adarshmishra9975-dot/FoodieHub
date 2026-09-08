import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-stone-800 text-sm max-w-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="font-medium">{toastMessage}</span>
      </div>
    </div>
  );
};

export default Toast;
