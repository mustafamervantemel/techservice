import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ServiceRequest } from '@/types/database';
import { Clock, CircleCheck as CheckCircle, TrendingUp, Calendar, DollarSign, Search } from 'lucide-react-native';

export default function ProviderDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    if (!user) return;

    try {
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerError) throw providerError;

      if (providerData) {
        setProviderId(providerData.id);
        await fetchRequests(providerData.id);
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRequests = async (pId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .or(`provider_id.eq.${pId},status.eq.pending`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);

      const pending = data?.filter((r) => r.status === 'pending').length || 0;
      const inProgress = data?.filter((r) => r.status === 'in_progress').length || 0;
      const completed = data?.filter((r) => r.status === 'completed').length || 0;

      setStats({ pending, inProgress, completed });
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProviderData();
  };

  const handleAssign = async (requestId: string) => {
    if (!providerId) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          provider_id: providerId,
          status: 'assigned',
        })
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert('Başarılı', 'Talep size atandı');
      fetchProviderData();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Talep atanırken bir hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Servis Talepleri</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Clock size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Beklemede</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <TrendingUp size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Devam Eden</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <CheckCircle size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Takip no veya açıklama ile ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.requestsList}>
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Talep bulunamadı</Text>
            </View>
          ) : (
            filteredRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.trackingNumber}>{request.tracking_number}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      request.status === 'pending' && styles.statusPending,
                      request.status === 'assigned' && styles.statusAssigned,
                      request.status === 'in_progress' && styles.statusInProgress,
                      request.status === 'completed' && styles.statusCompleted,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {request.status === 'pending' && 'Beklemede'}
                      {request.status === 'assigned' && 'Atandı'}
                      {request.status === 'in_progress' && 'Devam Ediyor'}
                      {request.status === 'completed' && 'Tamamlandı'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.requestDescription} numberOfLines={2}>
                  {request.description}
                </Text>

                <View style={styles.requestInfo}>
                  <View style={styles.infoItem}>
                    <Calendar size={16} color="#666" />
                    <Text style={styles.infoText}>{formatDate(request.appointment_date)}</Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  {request.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssign(request.id)}
                    >
                      <Text style={styles.assignButtonText}>Talebi Al</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/provider/request/[id]',
                        params: { id: request.id },
                      })
                    }
                  >
                    <Text style={styles.detailButtonText}>Detaylar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  searchSection: {
    padding: 16,
    paddingTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  requestsList: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusAssigned: {
    backgroundColor: '#E3F2FD',
  },
  statusInProgress: {
    backgroundColor: '#F3E5F5',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  requestDescription: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  requestInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  assignButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
});
