import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({ message, type = 'error', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700';

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-down ${bgColor} border rounded-lg p-4 shadow-lg max-w-sm`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
