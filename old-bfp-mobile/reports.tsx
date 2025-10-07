import React, { useState, useEffect, useCallback } from 'react';
import { View, SectionList, Alert, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Conditional import for react-native-maps
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const RNM = require('react-native-maps');
  MapView = RNM.default || RNM.MapView;
  Marker = RNM.Marker;
  Callout = RNM.Callout;
  PROVIDER_GOOGLE = RNM.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('react-native-maps not available on this platform');
}
import { apiGetAllReports } from '../../lib/api';
import { getUserToken } from '../../lib/storage';
import { getPriorityEmoji, getPriorityOrder } from '../../lib/utils';
import * as Location from 'expo-location';
import { YStack, XStack, Text, Spinner, Button } from 'tamagui';
import { Modal } from 'react-native';
import { getUserData } from '../../lib/storage';
import { Map } from '@tamagui/lucide-icons';
import { ReportListItem } from './components/ReportListItem';
import { ReportListHeader } from './components/ReportListHeader';
import { FilterModal } from './components/FilterModal';

interface Report {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  inspector_fullname?: string;
  category_name?: string;
  location_address?: string;
}

export default function BfpReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'status' | 'time'>('priority');
  const [filterStatus, setFilterStatus] = useState<string[]>(['all']);
  const [filterPriority, setFilterPriority] = useState<string[]>(['all']);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempSort, setTempSort] = useState<'priority' | 'status' | 'time'>('priority');
  const [tempStatus, setTempStatus] = useState<string[]>(['all']);
  const [tempPriority, setTempPriority] = useState<string[]>(['all']);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [verificationSheetOpen, setVerificationSheetOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  useEffect(() => {
    if (filterModalVisible) {
      setTempSort(sortBy);
      setTempStatus([...filterStatus]);
      setTempPriority([...filterPriority]);
    }
  }, [filterModalVisible, sortBy, filterStatus, filterPriority]);

  const router = useRouter();

  const fetchReports = useCallback(async () => {
    try {
      const token = await getUserToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }
      const res = await apiGetAllReports(token);
      if (res.status === 'success' && res.reports) {
        setReports(res.reports);
      } else {
        Alert.alert('Error', 'Could not fetch reports.');
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      Alert.alert('Error', 'Failed to load reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchReports();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      const userData = await getUserData();
      setUser(userData);
    })();
  }, [fetchReports]);

  useEffect(() => {
    let filtered = reports.filter(report => {
      if (!filterStatus.includes('all') && !filterStatus.includes(report.status)) return false;
      if (!filterPriority.includes('all') && !filterPriority.includes(report.priority)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 4, medium: 3, low: 2, emergency: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else if (sortBy === 'time') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

    setFilteredReports(filtered);
  }, [reports, sortBy, filterStatus, filterPriority]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '$orange10';
      case 'in_progress': return '$blue10';
      case 'resolved': return '$green10';
      case 'verified': return '$green10';
      case 'rejected': return '$red10';
      default: return '$gray10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '$red10';
      case 'medium': return '$orange10';
      case 'low': return '$gray10';
      case 'emergency': return '$red10';
      default: return '$gray10';
    }
  };

  const handleViewReport = (report: Report) => {
    const reportString = JSON.stringify(report);
    router.push({
      pathname: '/ReportDetails',
      params: { report: reportString },
    });
  };

  const handleVerification = (reportId: number, action: 'valid' | 'false' | 'pending') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action === 'valid' ? 'verified' : action === 'false' ? 'rejected' : 'pending' } : r));
    setVerificationSheetOpen(false);
  };

  const groupReportsByPriority = (reports: Report[]) => {
    const groups: { [key: string]: Report[] } = {};
    reports.forEach(report => {
      const priority = report.priority || 'low';
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(report);
    });
    return Object.entries(groups)
      .sort((a, b) => getPriorityOrder(b[0]) - getPriorityOrder(a[0]));
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$color" />
        <Text marginTop="$3" color="$color">Loading Reports...</Text>
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '$background' }}>
      <ReportListHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterPress={() => setFilterModalVisible(true)}
        filterStatus={filterStatus}
        filterPriority={filterPriority}
      />

      {/* Smart Filtering Bar */}
      <YStack backgroundColor="$background" paddingHorizontal="$md" paddingVertical="$sm">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space={8}>
            {/* Priority Filters */}
            <TouchableOpacity
              onPress={() => {
                if (filterPriority.includes('high')) {
                  setFilterPriority(filterPriority.filter(p => p !== 'high'));
                } else {
                  setFilterPriority([...filterPriority.filter(p => p !== 'all'), 'high']);
                }
              }}
              style={{
                backgroundColor: filterPriority.includes('high') ? '#D32F2F' : '$backgroundSoft',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: filterPriority.includes('high') ? '#D32F2F' : '$border',
              }}
            >
              <Text
                fontSize={14}
                fontWeight="500"
                color={filterPriority.includes('high') ? 'white' : '$text'}
              >
                🔴 High
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (filterPriority.includes('medium')) {
                  setFilterPriority(filterPriority.filter(p => p !== 'medium'));
                } else {
                  setFilterPriority([...filterPriority.filter(p => p !== 'all'), 'medium']);
                }
              }}
              style={{
                backgroundColor: filterPriority.includes('medium') ? '#FFA000' : '$backgroundSoft',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: filterPriority.includes('medium') ? '#FFA000' : '$border',
              }}
            >
              <Text
                fontSize={14}
                fontWeight="500"
                color={filterPriority.includes('medium') ? 'white' : '$text'}
              >
                🟠 Medium
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (filterPriority.includes('low')) {
                  setFilterPriority(filterPriority.filter(p => p !== 'low'));
                } else {
                  setFilterPriority([...filterPriority.filter(p => p !== 'all'), 'low']);
                }
              }}
              style={{
                backgroundColor: filterPriority.includes('low') ? '#6B7D99' : '$backgroundSoft',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: filterPriority.includes('low') ? '#6B7D99' : '$border',
              }}
            >
              <Text
                fontSize={14}
                fontWeight="500"
                color={filterPriority.includes('low') ? 'white' : '$text'}
              >
                🔵 Low
              </Text>
            </TouchableOpacity>

            {/* Status Filters */}
            <TouchableOpacity
              onPress={() => {
                if (filterStatus.includes('pending')) {
                  setFilterStatus(filterStatus.filter(s => s !== 'pending'));
                } else {
                  setFilterStatus([...filterStatus.filter(s => s !== 'all'), 'pending']);
                }
              }}
              style={{
                backgroundColor: filterStatus.includes('pending') ? '#FFA000' : '$backgroundSoft',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: filterStatus.includes('pending') ? '#FFA000' : '$border',
              }}
            >
              <Text
                fontSize={14}
                fontWeight="500"
                color={filterStatus.includes('pending') ? 'white' : '$text'}
              >
                ⏳ Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (filterStatus.includes('in_progress')) {
                  setFilterStatus(filterStatus.filter(s => s !== 'in_progress'));
                } else {
                  setFilterStatus([...filterStatus.filter(s => s !== 'all'), 'in_progress']);
                }
              }}
              style={{
                backgroundColor: filterStatus.includes('in_progress') ? '#0D47A1' : '$backgroundSoft',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: filterStatus.includes('in_progress') ? '#0D47A1' : '$border',
              }}
            >
              <Text
                fontSize={14}
                fontWeight="500"
                color={filterStatus.includes('in_progress') ? 'white' : '$text'}
              >
                🔄 In Progress
              </Text>
            </TouchableOpacity>

            {/* Clear Filters */}
            {(filterPriority.length > 1 || filterStatus.length > 1) && (
              <TouchableOpacity
                onPress={() => {
                  setFilterPriority(['all']);
                  setFilterStatus(['all']);
                }}
                style={{
                  backgroundColor: '$backgroundSoft',
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: '$border',
                }}
              >
                <Text fontSize={14} fontWeight="500" color="$textSecondary">
                  ✕ Clear
                </Text>
              </TouchableOpacity>
            )}
          </XStack>
        </ScrollView>
      </YStack>
      <YStack flex={1}>
        {viewMode === 'list' ? (
          <SectionList
            sections={groupReportsByPriority(filteredReports).map(([priority, reports]) => ({
              title: `${getPriorityEmoji(priority)} ${priority.toUpperCase()} PRIORITY`,
              data: reports,
              priority,
            }))}
            renderItem={({ item }) => (
              <ReportListItem
                item={item}
                userLocation={userLocation}
                onPress={() => handleViewReport(item)}
                onVerify={() => { setSelectedReport(item); setVerificationSheetOpen(true); }}
              />
            )}
            renderSectionHeader={({ section: { title, priority } }) => (
              <YStack marginTop="$6" marginBottom="$4" paddingHorizontal="$md">
                <Text fontSize={13} color="$textSecondary" textAlign="center">
                  ──────────────────
                </Text>
                <Text
                  fontSize={17}
                  fontWeight="600"
                  color="$text"
                  textAlign="center"
                  marginVertical="$2"
                >
                  {priority.toUpperCase()} PRIORITY
                </Text>
                <Text fontSize={13} color="$textSecondary" textAlign="center">
                  ──────────────────
                </Text>
              </YStack>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
          />
        ) : (
          MapView && userLocation?.coords ? (
            <View style={{ flex: 1, borderRadius: 15, overflow: 'hidden', margin: 16 }}>
              <MapView
                style={{ flex: 1 }}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                  }}
                  title="Your Location"
                  pinColor="#007AFF"
                />
                {filteredReports.map(report => {
                  const lat = parseFloat(report.latitude as any);
                  const lng = parseFloat(report.longitude as any);

                  if (!isNaN(lat) && !isNaN(lng)) {
                    return (
                      <Marker
                        key={report.id}
                        coordinate={{ latitude: lat, longitude: lng }}
                        title={report.title}
                        pinColor={getPriorityColor(report.priority)}
                      >
                        <Callout onPress={() => handleViewReport(report)}>
                          <YStack padding="$2" space="$1">
                            <Text fontWeight="bold">{report.title}</Text>
                            <Text fontSize={12} color="$textSecondary">
                              {report.description}
                            </Text>
                          </YStack>
                        </Callout>
                      </Marker>
                    );
                  }
                  return null;
                })}
              </MapView>
            </View>
          ) : (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Map size={48} color="$colorPress" />
              <Text marginTop="$3" color="$colorPress">
                {MapView ? 'Loading Map...' : 'Map not available on web'}
              </Text>
            </YStack>
          )
        )}
      </YStack>
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        tempSort={tempSort}
        onTempSortChange={setTempSort}
        tempStatus={tempStatus}
        onTempStatusChange={setTempStatus}
        tempPriority={tempPriority}
        onTempPriorityChange={setTempPriority}
        onApply={() => {
          setSortBy(tempSort);
          setFilterStatus([...tempStatus]);
          setFilterPriority([...tempPriority]);
          setFilterModalVisible(false);
        }}
        onClear={() => {
          setTempStatus(['all']);
          setTempPriority(['all']);
        }}
      />
      <Modal visible={verificationSheetOpen} animationType="slide" transparent={true} onRequestClose={() => setVerificationSheetOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setVerificationSheetOpen(false)}>
          <YStack flex={1} justifyContent="flex-end">
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <YStack backgroundColor="$background" padding={16} borderTopLeftRadius={16} borderTopRightRadius={16}>
                {selectedReport && (
                  <YStack space={16}>
                    <Text fontSize={18} fontWeight="bold">Hazard Verification</Text>
                    <Text fontWeight="bold">{selectedReport.title}</Text>
                    <Text>{selectedReport.description}</Text>
                    <XStack space={8}>
                      <Button size={4} backgroundColor="$green10" onPress={() => handleVerification(selectedReport.id, 'valid')}>Valid</Button>
                      <Button size={4} backgroundColor="$red10" onPress={() => handleVerification(selectedReport.id, 'false')}>False</Button>
                      <Button size={4} backgroundColor="$orange10" onPress={() => handleVerification(selectedReport.id, 'pending')}>Pending</Button>
                    </XStack>
                    <Button size={4} onPress={() => {}}>Forward to Team</Button>
                  </YStack>
                )}
              </YStack>
            </TouchableOpacity>
          </YStack>
        </TouchableOpacity>
      </Modal>

      {/* Floating Action Button */}
      {user?.role === 'inspector' && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: '#FF6B6B',
            borderRadius: 50,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => setActionModalVisible(true)}
        >
          <Text style={{ fontSize: 18 }}>🎛️</Text>
        </TouchableOpacity>
      )}

      {/* Action Modal */}
      <Modal visible={actionModalVisible} animationType="fade" transparent={true} onRequestClose={() => setActionModalVisible(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setActionModalVisible(false)}>
          <YStack flex={1} justifyContent="center" alignItems="center">
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <YStack backgroundColor="$background" padding={20} borderRadius={16} width={300}>
                <Text fontSize={18} fontWeight="bold" marginBottom={16} textAlign="center">Quick Actions</Text>
                <YStack space={12}>
                  <Button size={4} onPress={() => { setActionModalVisible(false); router.push('/(bfp)/proximity'); }}>View Proximity Map</Button>
                  <Button size={4} onPress={() => { setActionModalVisible(false); Alert.alert('Emergency', 'Emergency contact initiated'); }}>Emergency Contact</Button>
                  <Button size={4} onPress={() => { setActionModalVisible(false); Alert.alert('Report', 'Bulk report update initiated'); }}>Bulk Update Reports</Button>
                  <Button size={4} backgroundColor="$red10" onPress={() => setActionModalVisible(false)}>Close</Button>
                </YStack>
              </YStack>
            </TouchableOpacity>
          </YStack>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
