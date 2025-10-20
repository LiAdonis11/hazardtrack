import React, { useState } from 'react';
import ResidentsList from './ResidentsList';
import BfpPersonnelList from './BfpPersonnelList';
import CreateBfpUser from '../CreateBfpUser';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('residents');

  const tabs = [
    { id: 'residents', label: 'Residents', component: ResidentsList },
    { id: 'bfp-personnel', label: 'BFP Personnel', component: BfpPersonnelList },
    { id: 'create-bfp', label: 'Create BFP Account', component: CreateBfpUser }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ResidentsList;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500">Manage residents and BFP personnel accounts</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100 p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Active Tab Content */}
          <div className="tab-content">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
