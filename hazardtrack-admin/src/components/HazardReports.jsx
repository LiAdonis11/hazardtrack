import { useState } from 'react';
import AllReports from './Reports/AllReports';
import AssignedReports from './Reports/AssignedReports';
import ResolvedReports from './Reports/ResolvedReports';

const HazardReports = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Reports', component: AllReports },
    { id: 'assigned', label: 'Assigned Reports', component: AssignedReports },
    { id: 'resolved', label: 'Resolved Reports Archive', component: ResolvedReports }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="hazard-reports-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hazard Reports</h1>
        <p className="text-gray-600">Manage and monitor all hazard reports in the system</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
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
      </div>

      {/* Active Tab Content */}
      <div className="tab-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default HazardReports;
