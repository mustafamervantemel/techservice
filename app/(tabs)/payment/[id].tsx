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
import { ServicePayment } from '@/types/database';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react-native';

export default function Payment() {
  const router = useRouter();
  const { id, requestId } = useLocalSearchParams();
  const [payment, setPayment] = useState<ServicePayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      const { data, error } = await supabase
        .from('service_payments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment:', error);
      Alert.alert('Hata', 'Ödeme bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm kart bilgilerini giriniz');
      return;
    }

    if (cardData.number.replace(/\s/g, '').length !== 16) {
      Alert.alert('Hata', 'Kart numarası 16 haneli olmalıdır');
      return;
    }

    if (cardData.cvv.length !== 3) {
      Alert.alert('Hata', 'CVV 3 haneli olmalıdır');
      return;
    }

    setProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('service_payments')
        .update({
          payment_status: 'paid',
          payment_method: 'credit_card',
          paid_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Başarılı', 'Ödemeniz başarıyla tamamlandı', [
        {
          text: 'Tamam',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.container}>
        <Text>Ödeme bilgisi bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Ödenecek Tutar</Text>
          <Text style={styles.amountValue}>{payment.total_amount.toFixed(2)} ₺</Text>

          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Servis Ücreti:</Text>
              <Text style={styles.breakdownValue}>{payment.service_fee.toFixed(2)} ₺</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>İşçilik Ücreti:</Text>
              <Text style={styles.breakdownValue}>{payment.labor_cost.toFixed(2)} ₺</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Malzeme Ücreti:</Text>
              <Text style={styles.breakdownValue}>{payment.material_cost.toFixed(2)} ₺</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Kart Bilgileri</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kart Numarası</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChangeText={(value) =>
                  setCardData({ ...cardData, number: formatCardNumber(value) })
                }
                keyboardType="numeric"
                maxLength={19}
                editable={!processing}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kart Üzerindeki İsim</Text>
              <TextInput
                style={styles.input}
                placeholder="AD SOYAD"
                value={cardData.name}
                onChangeText={(value) => setCardData({ ...cardData, name: value.toUpperCase() })}
                autoCapitalize="characters"
                editable={!processing}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>Son Kullanma Tarihi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AA/YY"
                  value={cardData.expiry}
                  onChangeText={(value) =>
                    setCardData({ ...cardData, expiry: formatExpiry(value) })
                  }
                  keyboardType="numeric"
                  maxLength={5}
                  editable={!processing}
                />
              </View>

              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cardData.cvv}
                  onChangeText={(value) =>
                    setCardData({ ...cardData, cvv: value.replace(/\D/g, '').substring(0, 3) })
                  }
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  editable={!processing}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.securityInfo}>
          <Lock size={16} color="#666" />
          <Text style={styles.securityText}>
            Ödeme bilgileriniz 256-bit SSL sertifikası ile güvence altındadır
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.payButton, processing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={processing}
          >
            <Text style={styles.payButtonText}>
              {processing ? 'İşlem Yapılıyor...' : `${payment.total_amount.toFixed(2)} ₺ Öde`}
            </Text>
          </TouchableOpacity>
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
  amountCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 24,
    borderRadius: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 20,
  },
  breakdown: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  breakdownValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
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
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
