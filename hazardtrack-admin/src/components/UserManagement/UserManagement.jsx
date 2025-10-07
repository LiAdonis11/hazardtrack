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
    <div className="user-management-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage residents and BFP personnel accounts</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
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
  );
};

export default UserManagement;
