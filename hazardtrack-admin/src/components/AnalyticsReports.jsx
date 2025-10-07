import { useState } from 'react';
import StatisticsDashboard from './Analytics/StatisticsDashboard';
import HotspotMap from './Analytics/HotspotMap';
import ExportData from './Analytics/ExportData'; // Assuming this component exists
import GenerateReports from './Analytics/GenerateReports'; // Assuming this component exists

const AnalyticsReports = () => {
  const [activeTab, setActiveTab] = useState('statistics');

  const tabs = [
    { id: 'statistics', label: 'Statistics', component: StatisticsDashboard },
    { id: 'hotspot-map', label: 'Hotspot Map', component: HotspotMap },
    { id: 'export-data', label: 'Export Data', component: ExportData },
    { id: 'generate-reports', label: 'Generate Reports', component: GenerateReports }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">View analytics, generate reports, and export data.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-1.5 border border-gray-200 inline-flex items-center">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Active Tab Content */}
      <div>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default AnalyticsReports;
