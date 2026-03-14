import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleManualLogin = async () => {
    if (!accessToken.trim()) {
      Alert.alert('Erro', 'Por favor, insira um token de acesso válido.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`
      );
      
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      
      const userData = await response.json();
      
      const user = {
        accessToken,
        userId: userData.id,
        name: userData.name,
      };
      
      navigation.replace('Main', { user });
    } catch (error) {
      Alert.alert('Erro', 'Token de acesso inválido. Por favor, verifique e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const success = await login();
      if (success) {
        navigation.replace('Main');
      } else {
        Alert.alert(
          'Aviso',
          'O login via Facebook requer configuração adicional. Por favor, use o login manual com token de acesso ou configure o app no Facebook Developers.'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer login com Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>FB</Text>
          </View>
          <Text style={styles.title}>Auto Post</Text>
          <Text style={styles.subtitle}>
            Publique automaticamente nos seus grupos do Facebook
          </Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity
            style={[styles.facebookButton, isLoading && styles.buttonDisabled]}
            onPress={handleFacebookLogin}
            disabled={isLoading}
          >
            <Text style={styles.facebookButtonText}>Entrar com Facebook</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Token de Acesso do Facebook</Text>
          <TextInput
            style={styles.input}
            value={accessToken}
            onChangeText={setAccessToken}
            placeholder="Cole seu access_token aqui"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleManualLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Entrando...' : 'Entrar com Token'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningTitle}>⚠️ Importante</Text>
          <Text style={styles.warningText}>
            • Este app requer aprovação do Facebook para funcionar automaticamente
            • Postagens em grupos podem violar os Termos de Serviço do Facebook
            • Use com responsabilidade para evitar penalidades na conta
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#1877f2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  facebookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  loginButton: {
    backgroundColor: '#42b72a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  warning: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});
