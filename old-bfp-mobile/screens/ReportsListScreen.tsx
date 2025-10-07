import { useState } from 'react'
import { YStack, XStack, Text, Card, Input, Button } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { Search, Filter, MapPin, AlertTriangle, Flame, Zap, Home, Factory, User } from '@tamagui/lucide-icons'

interface Report {
  id: string
  hazardType: string
  icon?: string
  location: string
  status: string
  priority: string
  timestamp: string
}

interface ReportsListScreenProps {
  onSelectReport: (report: Report) => void
  onNavigate: (screen: string) => void
}

const mockReports: Report[] = [
  {
    id: 'R001',
    hazardType: 'Fire Hazard',
    icon: 'flame',
    location: 'Barangay Poblacion, Quezon City',
    status: 'New',
    priority: 'High',
    timestamp: '2 mins ago',
  },
  {
    id: 'R002',
    hazardType: 'Electrical Hazard',
    icon: 'zap',
    location: 'Makati Business District',
    status: 'In-Progress',
    priority: 'Medium',
    timestamp: '15 mins ago',
  },
  {
    id: 'R003',
    hazardType: 'Building Safety',
    icon: 'home',
    location: 'Taguig City Center',
    status: 'Valid',
    priority: 'Low',
    timestamp: '1 hour ago',
  },
  {
    id: 'R004',
    hazardType: 'Industrial Fire Risk',
    icon: 'factory',
    location: 'Pasig Industrial Area',
    status: 'New',
    priority: 'High',
    timestamp: '2 hours ago',
  },
]

const statusStyles = {
  "New": { backgroundColor: "$accent", color: "$accentForeground" },
  "Valid": { backgroundColor: "$green100", color: "$green800" },
  "In-Progress": { backgroundColor: "$blue100", color: "$blue800" },
  "Resolved": { backgroundColor: "$gray100", color: "$gray800" }
}

const priorityColors = {
  "High": "$primary",
  "Medium": "$orange500",
  "Low": "$green500"
}

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'flame':
      return Flame
    case 'zap':
      return Zap
    case 'home':
      return Home
    case 'factory':
      return Factory
    default:
      return AlertTriangle
  }
}

export function ReportsListScreen({ onSelectReport, onNavigate }: ReportsListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack backgroundColor="white" paddingHorizontal={16} paddingVertical={16} paddingTop={24} borderBottomWidth={1} borderBottomColor="$border">
        <Text fontSize={20} fontWeight="600" color="$color" marginBottom={16}>Incoming Hazard Reports</Text>

        {/* Search and Filter */}
        <XStack space={8}>
          <XStack alignItems="center" flex={1} backgroundColor="white" borderWidth={1} borderColor="$border" borderRadius={8} paddingHorizontal={12}>
            <Search size={16} color="$mutedForeground" />
            <Input
              flex={1}
              placeholder="Search reports..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              borderWidth={0}
              backgroundColor="transparent"
              paddingLeft={8}
            />
          </XStack>
          <Button variant="outlined" size="$sm" circular>
            <Filter size={16} />
          </Button>
        </XStack>
      </YStack>

      {/* Reports List */}
      <YStack padding={16} space={12} paddingBottom={80}>
        {mockReports.map((report) => {
          const IconComponent = getIcon(report.icon)
          return (
            <Card
              key={report.id}
              onPress={() => onSelectReport(report)}
              pressStyle={{ scale: 0.95 }}
              padding={16}
            >
              <XStack alignItems="flex-start" justifyContent="space-between" marginBottom={12}>
                <XStack alignItems="center" space={12}>
                  <YStack width={40} height={40} backgroundColor="$primary/10" borderRadius={8} alignItems="center" justifyContent="center">
                    <IconComponent size={20} color="$primary" />
                  </YStack>
                  <YStack>
                    <Text fontSize={16} fontWeight="600" color="$color">{report.hazardType}</Text>
                    <Text fontSize={12} color="$mutedForeground">{report.timestamp}</Text>
                  </YStack>
                </XStack>
                <YStack width={12} height={12} borderRadius={6} backgroundColor={priorityColors[report.priority as keyof typeof priorityColors]} />
              </XStack>

              <XStack alignItems="center" space={4} marginBottom={12}>
                <MapPin size={14} color="$mutedForeground" />
                <Text fontSize={14} color="$mutedForeground" flex={1}>{report.location}</Text>
              </XStack>

              <XStack alignItems="center" justifyContent="space-between">
                <Text {...statusStyles[report.status as keyof typeof statusStyles]} paddingHorizontal={8} paddingVertical={4} borderRadius={4} fontSize={12} fontWeight="500">
                  {report.status}
                </Text>
                <Text fontSize={10} color="$mutedForeground">
                  Priority: {report.priority}
                </Text>
              </XStack>
            </Card>
          )
        })}
      </YStack>

      {/* Bottom Navigation */}
      <XStack position="absolute" bottom={0} left={0} right={0} backgroundColor="white" borderTopWidth={1} borderTopColor="$border" paddingHorizontal={16} paddingVertical={8} justifyContent="space-around">
        <YStack alignItems="center" space={4} backgroundColor="$muted" paddingVertical={8} paddingHorizontal={8} borderRadius={8} flex={1} marginHorizontal={4}>
          <TouchableOpacity onPress={() => onNavigate('reports')} style={{ alignItems: 'center' }}>
            <AlertTriangle size={20} color="$primary" />
            <Text fontSize={12} color="$primary">Reports</Text>
          </TouchableOpacity>
        </YStack>
        <YStack alignItems="center" space={4} backgroundColor="transparent" paddingVertical={8} paddingHorizontal={8} borderRadius={8} flex={1} marginHorizontal={4}>
          <TouchableOpacity onPress={() => onNavigate('nearby')} style={{ alignItems: 'center' }}>
            <MapPin size={20} color="$mutedForeground" />
            <Text fontSize={12} color="$mutedForeground">Nearby</Text>
          </TouchableOpacity>
        </YStack>
        <YStack alignItems="center" space={4} backgroundColor="transparent" paddingVertical={8} paddingHorizontal={8} borderRadius={8} flex={1} marginHorizontal={4}>
          <TouchableOpacity onPress={() => onNavigate('profile')} style={{ alignItems: 'center' }}>
            <User size={20} color="$mutedForeground" />
            <Text fontSize={12} color="$mutedForeground">Profile</Text>
          </TouchableOpacity>
        </YStack>
      </XStack>
    </YStack>
  )
}
