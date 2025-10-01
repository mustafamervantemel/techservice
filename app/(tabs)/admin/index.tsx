import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Users,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
} from 'lucide-react-native';

type Stats = {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalRevenue: number;
  totalProviders: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalRevenue: 0,
    totalProviders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: requestCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: completedCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { data: payments } = await supabase
        .from('service_payments')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = payments?.reduce((sum, p) => sum + p.total_amount, 0) || 0;

      const { count: providerCount } = await supabase
        .from('service_providers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalUsers: userCount || 0,
        totalRequests: requestCount || 0,
        pendingRequests: pendingCount || 0,
        completedRequests: completedCount || 0,
        totalRevenue,
        totalProviders: providerCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/login');
        },
      },
    ]);
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
        <Text style={styles.headerTitle}>Yönetim Paneli</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
        }
      >
        <View style={styles.welcomeCard}>
          <Settings size={32} color="#fff" />
          <Text style={styles.welcomeTitle}>360 Teknik Servis</Text>
          <Text style={styles.welcomeText}>Sistem Yönetim Paneli</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel İstatistikler</Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Users size={28} color="#2196F3" />
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <ClipboardList size={28} color="#FF9800" />
              <Text style={styles.statValue}>{stats.totalRequests}</Text>
              <Text style={styles.statLabel}>Toplam Talep</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
              <TrendingUp size={28} color="#E91E63" />
              <Text style={styles.statValue}>{stats.pendingRequests}</Text>
              <Text style={styles.statLabel}>Bekleyen Talep</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <ClipboardList size={28} color="#4CAF50" />
              <Text style={styles.statValue}>{stats.completedRequests}</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finansal Özet</Text>

          <View style={styles.revenueCard}>
            <DollarSign size={32} color="#4CAF50" />
            <View style={styles.revenueContent}>
              <Text style={styles.revenueLabel}>Toplam Gelir</Text>
              <Text style={styles.revenueValue}>{stats.totalRevenue.toFixed(2)} ₺</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servis Sağlayıcılar</Text>

          <View style={styles.infoCard}>
            <Users size={24} color="#FF6B35" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Aktif Servis Sağlayıcı</Text>
              <Text style={styles.infoValue}>{stats.totalProviders}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
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
  welcomeCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  revenueCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  revenueContent: {
    flex: 1,
    gap: 4,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#666',
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF5350',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
