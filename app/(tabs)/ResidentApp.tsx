// import { useState } from 'react'
// import { ResidentLoginScreen } from './ResidentLoginScreen'
// import { ResidentRegisterScreen } from './ResidentRegisterScreen'
// import { ResidentDashboard } from './ResidentDashboard'
// import { SubmitReportScreen } from './SubmitReportScreen'
// import { MyReportsScreen } from './MyReportsScreen'
// import { ReportDetailsScreen } from './ReportDetailsScreen'
// import { EmergencyScreen } from './EmergencyScreen'
// import { ProfileScreen } from './ProfileScreen'
// import { Report } from '../../App'

// type ResidentScreen = 'login' | 'register' | 'dashboard' | 'submit' | 'reports' | 'details' | 'emergency' | 'profile'

// interface ResidentAppProps {
//   isLoggedIn: boolean
//   onLogin: () => void
//   onLogout: () => void
// }

// export function ResidentApp({ isLoggedIn, onLogin, onLogout }: ResidentAppProps) {
//   const [currentScreen, setCurrentScreen] = useState<ResidentScreen>('login')
//   const [selectedReport, setSelectedReport] = useState<Report | null>(null)

//   const handleLogin = () => {
//     onLogin()
//     setCurrentScreen('dashboard')
//   }

//   const handleRegister = () => {
//     setCurrentScreen('login')
//   }

//   const handleNavigate = (screen: ResidentScreen) => {
//     setCurrentScreen(screen)
//   }

//   const handleSelectReport = (report: Report) => {
//     setSelectedReport(report)
//     setCurrentScreen('details')
//   }

//   const handleBack = () => {
//     if (currentScreen === 'details' || currentScreen === 'submit' || currentScreen === 'reports' || currentScreen === 'emergency' || currentScreen === 'profile') {
//       setCurrentScreen('dashboard')
//     } else if (currentScreen === 'register') {
//       setCurrentScreen('login')
//     } else {
//       setCurrentScreen('dashboard')
//     }
//   }

//   if (!isLoggedIn) {
//     return (
//       <>
//         {currentScreen === 'login' && (
//           <ResidentLoginScreen 
//             onLogin={handleLogin}
//             onNavigateToRegister={() => setCurrentScreen('register')}
//           />
//         )}
//         {currentScreen === 'register' && (
//           <ResidentRegisterScreen 
//             onRegister={handleRegister}
//             onBack={handleBack}
//           />
//         )}
//       </>
//     )
//   }

//   return (
//     <>
//       {currentScreen === 'dashboard' && (
//         <ResidentDashboard 
//           onNavigate={handleNavigate}
//           onLogout={onLogout}
//         />
//       )}
      
//       {currentScreen === 'submit' && (
//         <SubmitReportScreen onBack={handleBack} />
//       )}
      
//       {currentScreen === 'reports' && (
//         <MyReportsScreen 
//           onBack={handleBack}
//           onSelectReport={handleSelectReport}
//         />
//       )}
      
//       {currentScreen === 'details' && selectedReport && (
//         <ReportDetailsScreen 
//           report={selectedReport}
//           onBack={handleBack}
//         />
//       )}
      
//       {currentScreen === 'emergency' && (
//         <EmergencyScreen onBack={handleBack} />
//       )}
      
//       {currentScreen === 'profile' && (
//         <ProfileScreen onBack={handleBack} />
//       )}
//     </>
//   )
// }