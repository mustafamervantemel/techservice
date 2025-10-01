import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ServiceRequest, ServicePayment } from '@/types/database';
import { ArrowLeft, MapPin, Calendar, FileText, User, Phone, DollarSign, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function ProviderRequestDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [payment, setPayment] = useState<ServicePayment | null>(null);
  const [paymentData, setPaymentData] = useState({
    serviceFee: '',
    laborCost: '',
    materialCost: '',
  });

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
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', requestData.customer_id)
          .maybeSingle();

        if (!customerError) {
          setCustomerInfo(customerData);
        }

        const { data: paymentData, error: paymentError } = await supabase
          .from('service_payments')
          .select('*')
          .eq('request_id', requestData.id)
          .maybeSingle();

        if (!paymentError && paymentData) {
          setPayment(paymentData);
          setPaymentData({
            serviceFee: paymentData.service_fee.toString(),
            laborCost: paymentData.labor_cost.toString(),
            materialCost: paymentData.material_cost.toString(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching request detail:', error);
      Alert.alert('Hata', 'Talep detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Başarılı', 'Talep durumu güncellendi');
      fetchRequestDetail();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Durum güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const createPayment = async () => {
    if (!paymentData.serviceFee || !paymentData.laborCost || !paymentData.materialCost) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm ücret alanlarını doldurunuz');
      return;
    }

    const serviceFee = parseFloat(paymentData.serviceFee);
    const laborCost = parseFloat(paymentData.laborCost);
    const materialCost = parseFloat(paymentData.materialCost);

    if (isNaN(serviceFee) || isNaN(laborCost) || isNaN(materialCost)) {
      Alert.alert('Hata', 'Lütfen geçerli sayısal değerler giriniz');
      return;
    }

    const totalAmount = serviceFee + laborCost + materialCost;

    setUpdating(true);
    try {
      if (payment) {
        const { error } = await supabase
          .from('service_payments')
          .update({
            service_fee: serviceFee,
            labor_cost: laborCost,
            material_cost: materialCost,
            total_amount: totalAmount,
          })
          .eq('id', payment.id);

        if (error) throw error;
        Alert.alert('Başarılı', 'Ödeme bilgileri güncellendi');
      } else {
        const { error } = await supabase.from('service_payments').insert({
          request_id: id,
          service_fee: serviceFee,
          labor_cost: laborCost,
          material_cost: materialCost,
          total_amount: totalAmount,
          payment_status: 'pending',
        });

        if (error) throw error;
        Alert.alert('Başarılı', 'Ödeme bilgileri oluşturuldu');
      }

      fetchRequestDetail();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Ödeme oluşturulurken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const completeService = async () => {
    Alert.alert('Servisi Tamamla', 'Servisi tamamlamak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Tamamla',
        onPress: async () => {
          await updateStatus('completed');
        },
      },
    ]);
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

  if (!request) {
    return (
      <View style={styles.container}>
        <Text>Talep bulunamadı</Text>
      </View>
    );
  }

  const address = request.address as any;
  const totalAmount =
    parseFloat(paymentData.serviceFee || '0') +
    parseFloat(paymentData.laborCost || '0') +
    parseFloat(paymentData.materialCost || '0');

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
          <Text style={styles.trackingNumber}>{request.tracking_number}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Ad Soyad:</Text>
            <Text style={styles.cardValue}>{customerInfo?.full_name}</Text>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Phone size={16} color="#666" />
              <Text style={styles.cardValue}>{customerInfo?.phone}</Text>
            </View>
          </View>
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
            <Text style={styles.cardValue}>{formatDate(request.appointment_date)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Adres</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>
              {address.city}, {address.district}, {address.neighborhood}
              {address.site_name && `, ${address.site_name}`}
              {address.block && ` Blok: ${address.block}`}
              {'\n'}Kat/Daire: {address.floor_apartment}
            </Text>
          </View>
        </View>

        {request.status !== 'pending' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Ücretlendirme</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Servis Ücreti (₺)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={paymentData.serviceFee}
                  onChangeText={(value) =>
                    setPaymentData({ ...paymentData, serviceFee: value })
                  }
                  keyboardType="decimal-pad"
                  editable={!updating && request.status !== 'completed'}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>İşçilik Ücreti (₺)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={paymentData.laborCost}
                  onChangeText={(value) => setPaymentData({ ...paymentData, laborCost: value })}
                  keyboardType="decimal-pad"
                  editable={!updating && request.status !== 'completed'}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Malzeme Ücreti (₺)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={paymentData.materialCost}
                  onChangeText={(value) =>
                    setPaymentData({ ...paymentData, materialCost: value })
                  }
                  keyboardType="decimal-pad"
                  editable={!updating && request.status !== 'completed'}
                />
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Toplam Tutar:</Text>
                <Text style={styles.totalValue}>{totalAmount.toFixed(2)} ₺</Text>
              </View>

              {request.status !== 'completed' && (
                <TouchableOpacity
                  style={[styles.saveButton, updating && styles.buttonDisabled]}
                  onPress={createPayment}
                  disabled={updating}
                >
                  <Text style={styles.saveButtonText}>
                    {payment ? 'Ücretleri Güncelle' : 'Ücretleri Kaydet'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {request.status !== 'completed' && (
          <View style={styles.section}>
            <View style={styles.actionButtons}>
              {request.status === 'assigned' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => updateStatus('in_progress')}
                  disabled={updating}
                >
                  <Text style={styles.actionButtonText}>İşe Başla</Text>
                </TouchableOpacity>
              )}

              {request.status === 'in_progress' && payment && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={completeService}
                  disabled={updating}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Servisi Tamamla</Text>
                </TouchableOpacity>
              )}
            </View>
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
  trackingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    gap: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#999',
  },
  cardValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    lineHeight: 22,
  },
  description: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
