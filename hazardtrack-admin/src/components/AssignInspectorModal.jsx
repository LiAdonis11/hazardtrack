import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { API_URL, STORAGE_KEYS, ERROR_MESSAGES } from '../config';

const AssignInspectorModal = ({ isOpen, onClose, onAssign, report }) => {
  const [inspectors, setInspectors] = useState([]);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInspectors = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
          setError(ERROR_MESSAGES.TOKEN_EXPIRED);
          return;
        }

        const response = await fetch(`${API_URL}/get_users.php?role=inspector&status=active`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch inspectors list.');
        }

        const data = await response.json();
        if (data.status === 'success') {
          setInspectors(data.users);
        } else {
          setError(data.message || 'Could not load inspectors.');
        }
      } catch (err) {
        setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspectors();
  }, [isOpen]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedInspector) {
      setError('Please select an inspector to assign.');
      return;
    }

    setIsAssigning(true);
    setError('');

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`${API_URL}/assign_inspector.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_id: report.id,
          inspector_id: parseInt(selectedInspector, 10),
          notes: notes,
          priority: report.priority || 'medium',
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        onAssign(result.assignment); // Pass assignment details back
        handleClose();
      } else {
        setError(result.message || 'Failed to assign inspector.');
      }
    } catch (err) {
      console.error(err); // log the error
      setError(ERROR_MESSAGES.SERVER_ERROR);      
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setSelectedInspector('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Assign Inspector to Report #{report?.id}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Select an available inspector to investigate "{report?.title}".
                  </p>
                </div>

                <form onSubmit={handleAssign} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="inspector" className="block text-sm font-medium text-gray-700">Inspector</label>
                    <select
                      id="inspector"
                      value={selectedInspector}
                      onChange={(e) => setSelectedInspector(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      disabled={isLoading || isAssigning}
                    >
                      <option value="">{isLoading ? 'Loading...' : 'Select an Inspector'}</option>
                      {inspectors.map((inspector) => (
                        <option key={inspector.id} value={inspector.id}>
                          {inspector.fullname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Add any specific instructions for the inspector..."
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={handleClose} className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2">Cancel</button>
                    <button type="submit" disabled={isAssigning || isLoading} className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:bg-orange-300">
                      {isAssigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AssignInspectorModal;