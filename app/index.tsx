import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        router.replace('/auth/login');
      } else if (profile) {
        if (profile.user_type === 'admin') {
          router.replace('/(tabs)/admin');
        } else if (profile.user_type === 'provider') {
          router.replace('/(tabs)/provider');
        } else {
          router.replace('/(tabs)/home');
        }
      }
    }
  }, [session, profile, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
