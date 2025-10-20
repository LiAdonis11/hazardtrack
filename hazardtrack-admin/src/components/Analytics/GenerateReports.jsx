import React, { useState } from 'react';
import { API_URL } from '../../config';


const GenerateReports = () => {
  const [reportType, setReportType] = useState('weekly');
  const [dateRange, setDateRange] = useState('30d');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const params = new URLSearchParams({
        type: reportType,
        range: dateRange,
        charts: includeCharts.toString(),
        rawData: includeRawData.toString()
      });

      const response = await fetch(`${API_URL}/generate_report.php?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Create HTML file for download
          const htmlContent = data.html;
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hazardtrack_${reportType}_report_${new Date().toISOString().split('T')[0]}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          alert('Report generated successfully! The HTML file has been downloaded. You can open it in your browser and print it as PDF.');
        } else {
          alert('Report generation failed: ' + (data.message || 'Unknown error'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Report generation failed: ' + (errorData.message || 'Server error'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Report generation failed. Please check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const reportTemplates = [
    {
      id: 'weekly',
      title: 'Weekly Summary Report',
      description: 'Comprehensive weekly overview of hazard reports and activities',
      icon: '📅',
      sections: ['Executive Summary', 'Key Metrics', 'Top Hazards', 'Response Times', 'Recommendations']
    },
    {
      id: 'monthly',
      title: 'Monthly Performance Report',
      description: 'Detailed monthly analysis with trends and performance indicators',
      icon: '📊',
      sections: ['Monthly Overview', 'Trend Analysis', 'Performance Metrics', 'Hotspot Analysis', 'Action Items']
    },
    {
      id: 'bfp',
      title: 'BFP Operations Report',
      description: 'Operational report for BFP personnel and resource allocation',
      icon: '👮',
      sections: ['Personnel Status', 'Resource Utilization', 'Response Coverage', 'Training Needs', 'Equipment Status']
    },
    {
      id: 'lgu',
      title: 'LGU Coordination Report',
      description: 'Report for local government coordination and planning',
      icon: '🏛️',
      sections: ['Barangay Statistics', 'Coordination Activities', 'Community Programs', 'Infrastructure Needs', 'Policy Recommendations']
    }
  ];

  const selectedTemplate = reportTemplates.find(template => template.id === reportType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Generate Reports</h2>
        <p className="text-gray-500 mt-1">Create and download professional HTML reports for BFP and LGU (printable as PDF).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Select Report Type</h3>
            <div className="grid grid-cols-1 gap-3">
              {reportTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    reportType === template.id
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setReportType(template.id)}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{template.title}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">2. Configure Settings</h3>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="includeCharts"
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)} // Corrected class names
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="includeCharts" className="ml-2 text-sm text-gray-700">
                  Include charts and visualizations
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="includeRawData"
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)} // Corrected class names
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="includeRawData" className="ml-2 text-sm text-gray-700">
                  Include raw data tables
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Report Preview & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Preview & Generate</h3>

            {selectedTemplate && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{selectedTemplate.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.title}</h3>
                    <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Report Sections:</h4>
                  <ul className="space-y-1">
                    {selectedTemplate.sections.map((section, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-2">Report Details:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Time Period:</span>
                      <span className="ml-2 font-medium">
                        {dateRange === '7d' ? 'Last 7 days' :
                         dateRange === '30d' ? 'Last 30 days' :
                         dateRange === '90d' ? 'Last 90 days' : 'Last year'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Charts:</span>
                      <span className="ml-2 font-medium">{includeCharts ? 'Included' : 'Excluded'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Raw Data:</span>
                      <span className="ml-2 font-medium">{includeRawData ? 'Included' : 'Excluded'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Format:</span>
                      <span className="ml-2 font-medium">HTML (PDF-ready)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">Generate Report</h3>
            <p className="text-emerald-700 mb-4 text-sm">
              This will create a professional HTML report that can be opened in any browser and printed as PDF.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-semibold"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  Generate HTML Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateReports;
