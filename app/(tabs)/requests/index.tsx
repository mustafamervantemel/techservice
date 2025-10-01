import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ServiceRequest } from '@/types/database';
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle, ChevronRight } from 'lucide-react-native';

export default function MyRequests() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Beklemede',
          color: '#FFA726',
          icon: Clock,
        };
      case 'assigned':
        return {
          label: 'Atandı',
          color: '#42A5F5',
          icon: AlertCircle,
        };
      case 'in_progress':
        return {
          label: 'Devam Ediyor',
          color: '#5C6BC0',
          icon: AlertCircle,
        };
      case 'completed':
        return {
          label: 'Tamamlandı',
          color: '#66BB6A',
          icon: CheckCircle,
        };
      case 'cancelled':
        return {
          label: 'İptal Edildi',
          color: '#EF5350',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: '#999',
          icon: Clock,
        };
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
        <Text style={styles.headerTitle}>Taleplerim</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>Henüz Talep Yok</Text>
            <Text style={styles.emptyText}>
              Ana sayfadan hizmet seçerek ilk talebinizi oluşturabilirsiniz
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.createButtonText}>Talep Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              const StatusIcon = statusInfo.icon;

              return (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/requests/[id]',
                      params: { id: request.id },
                    })
                  }
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.trackingContainer}>
                      <Text style={styles.trackingLabel}>Takip No:</Text>
                      <Text style={styles.trackingNumber}>{request.tracking_number}</Text>
                    </View>
                    <View
                      style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}
                    >
                      <StatusIcon size={14} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestBody}>
                    <Text style={styles.requestDescription} numberOfLines={2}>
                      {request.description}
                    </Text>
                    <Text style={styles.requestDate}>
                      Randevu: {formatDate(request.appointment_date)}
                    </Text>
                  </View>

                  <View style={styles.requestFooter}>
                    <Text style={styles.viewDetails}>Detayları Gör</Text>
                    <ChevronRight size={20} color="#FF6B35" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  requestsList: {
    padding: 16,
    gap: 12,
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
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#999',
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestBody: {
    gap: 8,
  },
  requestDescription: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  requestDate: {
    fontSize: 13,
    color: '#666',
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewDetails: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
