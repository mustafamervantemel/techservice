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
import { ArrowLeft, Star, MessageSquare } from 'lucide-react-native';

export default function Review() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [qualityRating, setQualityRating] = useState(0);
  const [speedRating, setSpeedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (qualityRating === 0 || speedRating === 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen her iki kategoride de puan veriniz');
      return;
    }

    if (!user) {
      Alert.alert('Hata', 'Kullanıcı bilgileriniz bulunamadı');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('service_reviews').insert({
        request_id: id,
        customer_id: user.id,
        quality_rating: qualityRating,
        speed_rating: speedRating,
        comment: comment || null,
      });

      if (error) throw error;

      Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi. Teşekkür ederiz!', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Değerlendirme kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (
    currentRating: number,
    setRating: (rating: number) => void,
    disabled: boolean
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => !disabled && setRating(star)}
            disabled={disabled}
          >
            <Star
              size={40}
              color={star <= currentRating ? '#FFD700' : '#E0E0E0'}
              fill={star <= currentRating ? '#FFD700' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Değerlendirme</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Memnuniyet Anketi</Text>
          <Text style={styles.infoText}>
            Aldığınız hizmeti değerlendirerek deneyiminizi bizimle paylaşın
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmet Kalitesi</Text>
          <Text style={styles.sectionDescription}>
            Yapılan işin kalitesini değerlendiriniz (1-5 arası)
          </Text>
          {renderStars(qualityRating, setQualityRating, loading)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hız ve Zamanında Teslim</Text>
          <Text style={styles.sectionDescription}>
            Servisin hızını ve zamanında tamamlanmasını değerlendiriniz
          </Text>
          {renderStars(speedRating, setSpeedRating, loading)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={20} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Yorumunuz</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Deneyiminizi detaylı olarak paylaşmak isterseniz (Opsiyonel)
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Yorumunuzu buraya yazabilirsiniz..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
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
  infoCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
  section: {
    padding: 16,
    paddingTop: 8,
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
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
