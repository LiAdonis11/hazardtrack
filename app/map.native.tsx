import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { apiGetAllReports } from '../lib/api';
import { getUserToken, getUserData } from '../lib/storage';

const BfpMap = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserRoleAndFetchReports = async () => {
      const userData = await getUserData();
      if (userData?.role !== 'bfp_personnel' && userData?.role !== 'inspector') {
        setLoading(false);
        return;
      }
      fetchReports();
    }
    checkUserRoleAndFetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = await getUserToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }
      const res = await apiGetAllReports(token);
      if (res.status === 'success' && res.reports) {
        const reportsWithCoords = res.reports.filter(
          (report: any) => report.latitude && report.longitude
        );
        setReports(reportsWithCoords);
      } else {
        Alert.alert('Error', 'Could not fetch reports for map.');
      }
    } catch (error) {
      console.error('Failed to fetch reports for map:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report: any) => {
    const reportString = JSON.stringify(report);
    router.push({
      pathname: '/ReportDetails',
      params: { report: reportString },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text marginTop={10}>Loading Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 10 }}>
        Interactive maps are not available on mobile devices.
      </Text>
      <Text style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>
        Please use the web version to view the map with hazard reports.
      </Text>
      {reports.length > 0 && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
            Available Reports ({reports.length}):
          </Text>
          {reports.slice(0, 5).map((report, index) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => handleViewDetails(report)}
              style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' }}
            >
              <Text style={{ fontWeight: 'bold' }}>{report.title}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>
                Status: {report.status} • Lat: {report.latitude}, Lng: {report.longitude}
              </Text>
            </TouchableOpacity>
          ))}
          {reports.length > 5 && (
            <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
              ... and {reports.length - 5} more reports
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default BfpMap;