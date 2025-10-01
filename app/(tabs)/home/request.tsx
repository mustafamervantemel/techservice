import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, FileText } from 'lucide-react-native';

export default function ServiceRequest() {
  const router = useRouter();
  const { categoryId, categoryName, serviceGroup } = useLocalSearchParams();
  const { profile, user } = useAuth();
  const [description, setDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description || !appointmentDate || !appointmentTime) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz');
      return;
    }

    if (!user || !profile) {
      Alert.alert('Hata', 'Kullanıcı bilgileriniz bulunamadı');
      return;
    }

    setLoading(true);

    try {
      const appointmentDateTime = `${appointmentDate} ${appointmentTime}:00`;

      const { data: trackingData } = await supabase.rpc('generate_tracking_number');
      const trackingNumber = trackingData || `360TS${Date.now()}`;

      const { error } = await supabase.from('service_requests').insert({
        tracking_number: trackingNumber,
        customer_id: user.id,
        category_id: categoryId,
        service_group: serviceGroup,
        description,
        appointment_date: appointmentDateTime,
        status: 'pending',
        address: {
          city: profile.city,
          district: profile.district,
          neighborhood: profile.neighborhood,
          site_name: profile.site_name,
          block: profile.block,
          floor_apartment: profile.floor_apartment,
        },
      });

      if (error) throw error;

      Alert.alert(
        'Başarılı',
        `Servis talebiniz oluşturuldu!\n\nTakip Numarası: ${trackingNumber}`,
        [
          {
            text: 'Tamam',
            onPress: () => router.push('/(tabs)/requests'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Talep oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Servis Talebi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{categoryName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ad Soyad:</Text>
              <Text style={styles.infoValue}>{profile?.full_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefon:</Text>
              <Text style={styles.infoValue}>{profile?.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adres:</Text>
              <Text style={styles.infoValue}>
                {profile?.city}, {profile?.district}, {profile?.neighborhood}
                {profile?.site_name && `, ${profile.site_name}`}
                {profile?.block && ` Blok: ${profile.block}`}, Kat/Daire:{' '}
                {profile?.floor_apartment}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arıza Detayı</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <FileText size={20} color="#666" />
              <Text style={styles.label}>Arıza Açıklaması *</Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Arıza detaylarını yazınız..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Randevu Bilgileri</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Calendar size={20} color="#666" />
              <Text style={styles.label}>Randevu Tarihi *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="GG.AA.YYYY (örn: 15.03.2024)"
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              editable={!loading}
            />
            <Text style={styles.hint}>Tarih formatı: GG.AA.YYYY</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Randevu Saati *</Text>
            <TextInput
              style={styles.input}
              placeholder="SS:DD (örn: 14:30)"
              value={appointmentTime}
              onChangeText={setAppointmentTime}
              editable={!loading}
            />
            <Text style={styles.hint}>Saat formatı: SS:DD</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Talep Oluşturuluyor...' : 'Talep Oluştur'}
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
  categoryBadge: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  inputContainer: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
