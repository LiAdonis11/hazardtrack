import { useState } from 'react';
import AllReports from './Reports/AllReports';
// import AssignedReports from './Reports/AssignedReports';
// import ResolvedReports from './Reports/ResolvedReports';

const HazardReports = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Reports', component: AllReports },
    // { id: 'assigned', label: 'Assigned Reports', component: AssignedReports },
    // { id: 'resolved', label: 'Resolved Reports Archive', component: ResolvedReports }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Hazard Reports</h1>
            <p className="text-sm text-gray-500">Manage and monitor all hazard reports in the system</p>
          </div>
        </div>

        {/* Tabs */}
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
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HazardReports;
