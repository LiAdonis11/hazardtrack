import { useState } from 'react'
import { ReportsListScreen } from './ReportsListScreen'
import { CommunicationScreen } from './CommunicationScreen'

interface Report {
  id: string
  hazardType: string
  icon?: string
  location: string
  status: string
  priority: string
  timestamp: string
}

type BFPScreen = 'reports' | 'details' | 'communication' | 'nearby' | 'profile'

interface BFPAppProps {
  onLogout: () => void
}

export function BFPApp({ onLogout }: BFPAppProps) {
  const [currentScreen, setCurrentScreen] = useState<BFPScreen>('reports')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report)
    setCurrentScreen('details')
  }

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as BFPScreen)
  }

  const handleBack = () => {
    if (currentScreen === 'details' || currentScreen === 'nearby' || currentScreen === 'profile') {
      setCurrentScreen('reports')
    } else if (currentScreen === 'communication') {
      setCurrentScreen('details')
    } else {
      setCurrentScreen('reports')
    }
  }

  return (
    <>
      {currentScreen === 'reports' && (
        <ReportsListScreen
          onSelectReport={handleSelectReport}
          onNavigate={handleNavigate}
        />
      )}

      {/* {currentScreen === 'details' && selectedReport && (
        <HazardDetailsScreen
          report={selectedReport}
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      )} */}

      {currentScreen === 'communication' && (
        <CommunicationScreen onBack={handleBack} />
      )}

      {/* {currentScreen === 'nearby' && (
        <NearbyInspectionsScreen
          onBack={handleBack}
          onSelectReport={handleSelectReport}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen onBack={handleBack} />
      )} */}
    </>
  )
}