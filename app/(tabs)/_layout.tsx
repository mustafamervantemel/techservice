import { Tabs } from 'expo-router';
import { Hop as Home, ClipboardList, User, Settings } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { profile } = useAuth();

  if (profile?.user_type === 'provider') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="provider/index"
          options={{
            title: 'Talepler',
            tabBarIcon: ({ size, color }) => <ClipboardList size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="provider/profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen name="home/index" options={{ href: null }} />
        <Tabs.Screen name="home/services" options={{ href: null }} />
        <Tabs.Screen name="home/request" options={{ href: null }} />
        <Tabs.Screen name="requests/index" options={{ href: null }} />
        <Tabs.Screen name="requests/[id]" options={{ href: null }} />
        <Tabs.Screen name="payment/[id]" options={{ href: null }} />
        <Tabs.Screen name="review/[id]" options={{ href: null }} />
        <Tabs.Screen name="profile/index" options={{ href: null }} />
        <Tabs.Screen name="admin/index" options={{ href: null }} />
      </Tabs>
    );
  }

  if (profile?.user_type === 'admin') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="admin/index"
          options={{
            title: 'Yönetim',
            tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
          }}
        />
        <Tabs.Screen name="home/index" options={{ href: null }} />
        <Tabs.Screen name="home/services" options={{ href: null }} />
        <Tabs.Screen name="home/request" options={{ href: null }} />
        <Tabs.Screen name="requests/index" options={{ href: null }} />
        <Tabs.Screen name="requests/[id]" options={{ href: null }} />
        <Tabs.Screen name="payment/[id]" options={{ href: null }} />
        <Tabs.Screen name="review/[id]" options={{ href: null }} />
        <Tabs.Screen name="profile/index" options={{ href: null }} />
        <Tabs.Screen name="provider/index" options={{ href: null }} />
        <Tabs.Screen name="provider/profile" options={{ href: null }} />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests/index"
        options={{
          title: 'Taleplerim',
          tabBarIcon: ({ size, color }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="home/services" options={{ href: null }} />
      <Tabs.Screen name="home/request" options={{ href: null }} />
      <Tabs.Screen name="requests/[id]" options={{ href: null }} />
      <Tabs.Screen name="payment/[id]" options={{ href: null }} />
      <Tabs.Screen name="review/[id]" options={{ href: null }} />
      <Tabs.Screen name="provider/index" options={{ href: null }} />
      <Tabs.Screen name="provider/profile" options={{ href: null }} />
      <Tabs.Screen name="admin/index" options={{ href: null }} />
    </Tabs>
  );
}
