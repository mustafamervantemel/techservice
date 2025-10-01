import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Hop as HomeIcon, Car, Building2, ChevronRight } from 'lucide-react-native';

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();

  const serviceGroups = [
    {
      id: 'home_office',
      title: 'Ev ve İş Yeri Hizmetleri',
      description: 'Beyaz eşya, tesisat, elektrik, doğalgaz ve daha fazlası',
      icon: HomeIcon,
      color: '#4CAF50',
    },
    {
      id: 'vehicle',
      title: 'Motorlu Araç Hizmetleri',
      description: 'Çekici, yol yardım, lastikçi, araç bakım hizmetleri',
      icon: Car,
      color: '#2196F3',
    },
    {
      id: 'tender',
      title: '360 İhale Hizmetleri',
      description: 'Yüklenici ve yükleyici hizmetleri',
      icon: Building2,
      color: '#FF9800',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.userName}>{profile?.full_name}</Text>
        </View>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>360</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>360 Teknik Servis'e Hoş Geldiniz</Text>
          <Text style={styles.welcomeText}>
            İhtiyacınız olan hizmet grubunu seçerek servis talebinizi oluşturabilirsiniz
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmet Grupları</Text>

          {serviceGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.serviceCard}
              onPress={() =>
                router.push({
                  pathname: '/home/services',
                  params: { group: group.id },
                })
              }
            >
              <View style={[styles.iconContainer, { backgroundColor: group.color }]}>
                <group.icon size={32} color="#fff" />
              </View>

              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{group.title}</Text>
                <Text style={styles.serviceDescription}>{group.description}</Text>
              </View>

              <ChevronRight size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Hizmet grubunu seçin</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Servis talebinizi oluşturun</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Teknisyen randevunuza gelsin</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Güvenli ödeme yapın</Text>
            </View>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    gap: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  stepContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
});
