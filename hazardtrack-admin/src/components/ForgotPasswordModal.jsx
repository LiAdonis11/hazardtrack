import { X, Mail } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Forgot Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Mail size={48} className="text-orange-500" />
          </div>
          <p className="text-gray-700 leading-relaxed">
            For security reasons, admin password resets must be handled by the system administrator.
          </p>
          <p className="text-sm text-gray-600">
            Please contact the system administrator directly to reset your password.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
