import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Card, Spinner, Input } from 'tamagui';
import { useRouter } from 'expo-router';
import { apiGetAllReports } from '../../lib/api';
import { getUserToken } from '../../lib/storage';
import { Search, Filter, MapPin, AlertTriangle, Flame, Zap, Home, Factory } from '@tamagui/lucide-icons';

interface Report {
  id: number;
  hazardType: string;
  location: string;
  status: 'New' | 'Valid' | 'In-Progress' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  timestamp: string;
  icon?: string;
}

const mockReports: Report[] = [
  {
    id: 1,
    hazardType: 'Fire Hazard',
    icon: 'flame',
    location: 'Barangay Poblacion, Quezon City',
    status: 'New',
    priority: 'High',
    timestamp: '2 mins ago',
  },
  {
    id: 2,
    hazardType: 'Electrical Hazard',
    icon: 'zap',
    location: 'Makati Business District',
    status: 'In-Progress',
    priority: 'Medium',
    timestamp: '15 mins ago',
  },
  {
    id: 3,
    hazardType: 'Building Safety',
    icon: 'home',
    location: 'Taguig City Center',
    status: 'Valid',
    priority: 'Low',
    timestamp: '1 hour ago',
  },
  {
    id: 4,
    hazardType: 'Industrial Fire Risk',
    icon: 'factory',
    location: 'Pasig Industrial Area',
    status: 'New',
    priority: 'High',
    timestamp: '2 hours ago',
  },
];

const statusColors = {
  "New": "bg-accent text-accent-foreground",
  "Valid": "bg-green-100 text-green-800",
  "In-Progress": "bg-blue-100 text-blue-800",
  "Resolved": "bg-gray-100 text-gray-800"
};

const priorityColors = {
  "High": "#B71C1C",
  "Medium": "#FFA000",
  "Low": "#388E3C"
};

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'flame':
      return Flame;
    case 'zap':
      return Zap;
    case 'home':
      return Home;
    case 'factory':
      return Factory;
    default:
      return AlertTriangle;
  }
};

export default function ReportsListScreen() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const filtered = reports.filter(report =>
      report.hazardType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchQuery, reports]);

  const fetchReports = async () => {
    try {
      const token = await getUserToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }
      const res = await apiGetAllReports(token);
      if (res.status === 'success' && res.reports) {
        // Transform API reports to match design
        const transformed = res.reports.slice(0, 10).map((r: any) => ({
          id: r.id,
          hazardType: r.title,
          location: r.location_address || 'Unknown location',
          status: r.status === 'pending' ? 'New' : r.status === 'in_progress' ? 'In-Progress' : r.status === 'resolved' ? 'Resolved' : 'Valid',
          priority: r.priority === 'high' ? 'High' : r.priority === 'medium' ? 'Medium' : 'Low',
          timestamp: new Date(r.created_at).toLocaleString(),
          icon: r.category_name?.toLowerCase().includes('fire') ? 'flame' : r.category_name?.toLowerCase().includes('electrical') ? 'zap' : 'home'
        }));
        setReports(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSelectReport = (report: Report) => {
    const reportString = JSON.stringify(report);
    router.push({
      pathname: '/ReportDetails',
      params: { report: reportString },
    });
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'nearby') {
      router.push('/(bfp)/proximity');
    }
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="#FAFAFA">
        <Spinner size="large" color="#B71C1C" />
        <Text marginTop="$3" color="#202124">Loading Reports...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="#FAFAFA">
      {/* Header */}
      <YStack backgroundColor="white" paddingHorizontal="$4" paddingVertical="$4" paddingTop="$6" borderBottomWidth={1} borderBottomColor="#E5E7EB">
        <Text fontSize={20} fontWeight="600" color="#202124" marginBottom="$4">
          Incoming Hazard Reports
        </Text>

        {/* Search and Filter */}
        <XStack gap="$2">
          <XStack flex={1} alignItems="center" borderWidth={1} borderColor="#E5E7EB" borderRadius={8} paddingHorizontal="$3" backgroundColor="white">
            <Search size={16} color="#9E9E9E" />
            <Input
              flex={1}
              placeholder="Search reports..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              borderWidth={0}
              backgroundColor="transparent"
              paddingLeft="$2"
            />
          </XStack>
          <TouchableOpacity style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white"
          }}>
            <Filter size={16} color="#9E9E9E" />
          </TouchableOpacity>
        </XStack>
      </YStack>

      {/* Reports List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B71C1C']}
            tintColor="#B71C1C"
          />
        }
      >
        <YStack space="$3">
          {filteredReports.map((report) => {
            const IconComponent = getIcon(report.icon);
            return (
              <TouchableOpacity key={report.id} onPress={() => handleSelectReport(report)}>
                <Card padding="$4" borderRadius={12} backgroundColor="white" shadowColor="#000" shadowOpacity={0.05} shadowRadius={4} shadowOffset={{ width: 0, height: 1 }} elevation={1}>
                  <YStack space="$3">
                    <XStack alignItems="center" justifyContent="space-between">
                      <XStack alignItems="center" space="$3">
                        <YStack width={40} height={40} backgroundColor="#B71C1C20" borderRadius={8} alignItems="center" justifyContent="center">
                          <IconComponent size={20} color="#B71C1C" />
                        </YStack>
                        <YStack>
                          <Text fontSize={16} fontWeight="600" color="#202124">{report.hazardType}</Text>
                          <Text fontSize={12} color="#9E9E9E">{report.timestamp}</Text>
                        </YStack>
                      </XStack>
                      <YStack width={12} height={12} borderRadius={6} backgroundColor={priorityColors[report.priority]} />
                    </XStack>

                    <XStack alignItems="center" space="$1">
                      <MapPin size={14} color="#9E9E9E" />
                      <Text fontSize={14} color="#6B7280" flex={1}>{report.location}</Text>
                    </XStack>

                    <XStack alignItems="center" justifyContent="space-between">
                      <Text
                        fontSize={12}
                        fontWeight="500"
                        color={
                          report.status === 'New' ? '#FFA000' :
                          report.status === 'Valid' ? '#388E3C' :
                          report.status === 'In-Progress' ? '#0D47A1' :
                          '#6B7280'
                        }
                        backgroundColor={
                          report.status === 'New' ? '#FFA00020' :
                          report.status === 'Valid' ? '#388E3C20' :
                          report.status === 'In-Progress' ? '#0D47A120' :
                          '#6B728020'
                        }
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius={4}
                      >
                        {report.status}
                      </Text>
                      <Text fontSize={12} color="#9E9E9E">
                        Priority: {report.priority}
                      </Text>
                    </XStack>
                  </YStack>
                </Card>
              </TouchableOpacity>
            );
          })}
        </YStack>
      </ScrollView>

      {/* Bottom Navigation */}
      <XStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="#E5E7EB"
        paddingHorizontal="$4"
        paddingVertical="$2"
        justifyContent="space-around"
      >
        <TouchableOpacity style={{ alignItems: "center", paddingVertical: 8, backgroundColor: "#B71C1C20", borderRadius: 8, flex: 1, marginHorizontal: 4 }}>
          <AlertTriangle size={20} color="#B71C1C" />
          <Text fontSize={12} color="#B71C1C" marginTop="$1">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleNavigate('nearby')}
          style={{ alignItems: "center", paddingVertical: 8, borderRadius: 8, flex: 1, marginHorizontal: 4 }}
        >
          <MapPin size={20} color="#9E9E9E" />
          <Text fontSize={12} color="#9E9E9E" marginTop="$1">Nearby</Text>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
}
