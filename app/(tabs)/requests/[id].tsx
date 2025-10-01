import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ServiceRequest, ServicePayment } from '@/types/database';
import { ArrowLeft, MapPin, Calendar, FileText, CreditCard, Star } from 'lucide-react-native';

export default function RequestDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [payment, setPayment] = useState<ServicePayment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    try {
      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (requestError) throw requestError;
      setRequest(requestData);

      if (requestData) {
        const { data: paymentData, error: paymentError } = await supabase
          .from('service_payments')
          .select('*')
          .eq('request_id', requestData.id)
          .maybeSingle();

        if (!paymentError && paymentData) {
          setPayment(paymentData);
        }
      }
    } catch (error) {
      console.error('Error fetching request detail:', error);
      Alert.alert('Hata', 'Talep detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Beklemede',
      assigned: 'Atandı',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.container}>
        <Text>Talep bulunamadı</Text>
      </View>
    );
  }

  const address = request.address as any;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Talep Detayı</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.trackingCard}>
          <Text style={styles.trackingLabel}>Takip Numarası</Text>
          <Text style={styles.trackingNumber}>{request.tracking_number}</Text>
          <Text style={styles.statusText}>Durum: {getStatusText(request.status)}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Arıza Detayı</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.description}>{request.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Randevu Bilgisi</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>{formatDate(request.appointment_date)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Adres</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {address.city}, {address.district}, {address.neighborhood}
              {address.site_name && `, ${address.site_name}`}
              {address.block && ` Blok: ${address.block}`}
              {'\n'}Kat/Daire: {address.floor_apartment}
            </Text>
          </View>
        </View>

        {payment && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Ödeme Bilgisi</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Servis Ücreti:</Text>
                <Text style={styles.paymentValue}>{payment.service_fee.toFixed(2)} ₺</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>İşçilik Ücreti:</Text>
                <Text style={styles.paymentValue}>{payment.labor_cost.toFixed(2)} ₺</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Malzeme Ücreti:</Text>
                <Text style={styles.paymentValue}>{payment.material_cost.toFixed(2)} ₺</Text>
              </View>
              <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Toplam:</Text>
                <Text style={styles.totalValue}>{payment.total_amount.toFixed(2)} ₺</Text>
              </View>
              <View style={styles.paymentStatusContainer}>
                <Text
                  style={[
                    styles.paymentStatus,
                    payment.payment_status === 'paid'
                      ? styles.paymentStatusPaid
                      : styles.paymentStatusPending,
                  ]}
                >
                  {payment.payment_status === 'paid' ? 'Ödendi' : 'Ödeme Bekliyor'}
                </Text>
              </View>

              {payment.payment_status === 'pending' && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/payment/[id]',
                      params: { id: payment.id, requestId: request.id },
                    })
                  }
                >
                  <Text style={styles.payButtonText}>Ödeme Yap</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {request.status === 'completed' && payment?.payment_status === 'paid' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/review/[id]',
                  params: { id: request.id },
                })
              }
            >
              <Star size={20} color="#fff" />
              <Text style={styles.reviewButtonText}>Değerlendirme Yap</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  trackingCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  trackingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  cardText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  paymentStatusContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  paymentStatusPaid: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  paymentStatusPending: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  payButton: {
    backgroundColor: '#FF6B35',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
