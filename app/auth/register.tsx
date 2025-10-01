import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { UserPlus } from 'lucide-react-native';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    siteName: '',
    block: '',
    floorApartment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.fullName ||
      !formData.phone ||
      !formData.city ||
      !formData.district ||
      !formData.neighborhood ||
      !formData.floorApartment
    ) {
      setError('Lütfen zorunlu alanları doldurunuz');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          user_type: 'customer',
          full_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          neighborhood: formData.neighborhood,
          site_name: formData.siteName || null,
          block: formData.block || null,
          floor_apartment: formData.floorApartment,
        });

        if (profileError) throw profileError;

        router.replace('/');
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>360 Teknik Servis hesabı oluştur</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                E-posta <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                value={formData.email}
                onChangeText={(val) => updateField('email', val)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Şifre <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="En az 6 karakter"
                value={formData.password}
                onChangeText={(val) => updateField('password', val)}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Şifre Tekrar <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChangeText={(val) => updateField('confirmPassword', val)}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Ad Soyad <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Adınız Soyadınız"
                value={formData.fullName}
                onChangeText={(val) => updateField('fullName', val)}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Telefon <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="05XX XXX XX XX"
                value={formData.phone}
                onChangeText={(val) => updateField('phone', val)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adres Bilgileri</Text>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>
                  İl <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="İl"
                  value={formData.city}
                  onChangeText={(val) => updateField('city', val)}
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>
                  İlçe <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="İlçe"
                  value={formData.district}
                  onChangeText={(val) => updateField('district', val)}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Mahalle <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Mahalle"
                value={formData.neighborhood}
                onChangeText={(val) => updateField('neighborhood', val)}
                editable={!loading}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>Site Adı</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Opsiyonel"
                  value={formData.siteName}
                  onChangeText={(val) => updateField('siteName', val)}
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputContainer, styles.flex1]}>
                <Text style={styles.label}>Blok</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Opsiyonel"
                  value={formData.block}
                  onChangeText={(val) => updateField('block', val)}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Kat/Daire <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 3/5"
                value={formData.floorApartment}
                onChangeText={(val) => updateField('floorApartment', val)}
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <UserPlus size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  required: {
    color: '#FF6B35',
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
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
});
