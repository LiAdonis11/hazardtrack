import { useState } from 'react'
// import { LoginScreen } from '../LoginScreen' // File doesn't exist
import ReportsListScreen from '../ReportsListScreen'
import HazardDetailsScreen from '../HazardDetailsScreen'
import CommunicationScreen from '../CommunicationScreen'
import NearbyInspectionsScreen from '../NearbyInspectionsScreenOptimized'
import ProfileScreen from './ProfileScreen'
import NearbyInspectionsScreenOptimized from '../NearbyInspectionsScreenOptimized'
// import { Report } from '../../App' // File doesn't exist

type Report = any // Temporary type definition

type BFPScreen = 'login' | 'reports' | 'details' | 'communication' | 'nearby' | 'profile'

interface BFPAppProps {
  isLoggedIn: boolean
  onLogin: () => void
  onLogout: () => void
}

export default function BFPApp({ isLoggedIn, onLogin, onLogout }: BFPAppProps) {
  const [currentScreen, setCurrentScreen] = useState<BFPScreen>('login')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const handleLogin = () => {
    onLogin()
    setCurrentScreen('reports')
  }

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

  // Commented out since LoginScreen doesn't exist
  // if (!isLoggedIn) {
  //   return <LoginScreen onLogin={handleLogin} />
  // }

  return (
    <>
      {currentScreen === 'reports' && (
        <ReportsListScreen />
      )}

      {currentScreen === 'details' && selectedReport && (
        <HazardDetailsScreen />
      )}

      {currentScreen === 'communication' && (
        <CommunicationScreen />
      )}

      {currentScreen === 'nearby' && (
        <NearbyInspectionsScreenOptimized />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen />
      )}
    </>
  )
}