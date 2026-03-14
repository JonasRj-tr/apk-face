import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { FacebookService } from '../services/FacebookService';

interface PostScreenProps {
  navigation: any;
}

export const PostScreen: React.FC<PostScreenProps> = ({ navigation }) => {
  const { groups } = useAuth();
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [delay, setDelay] = useState(5);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<{ current: number; total: number; success: number; failed: number } | null>(null);

  const selectedGroups = groups.filter(g => g.selected);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É preciso permissão para acessar as fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setVideo(null);
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É preciso permissão para acessar os vídeos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setVideo(result.assets[0].uri);
      setImage(null);
    }
  };

  const removeMedia = () => {
    setImage(null);
    setVideo(null);
  };

  const startPosting = async () => {
    if (!message.trim() && !image && !video) {
      Alert.alert('Erro', 'Adicione um texto, imagem ou vídeo para postar.');
      return;
    }

    if (selectedGroups.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um grupo.');
      return;
    }

    Alert.alert(
      'Confirmar Publicação',
      `Você vai publicar em ${selectedGroups.length} grupo${selectedGroups.length > 1 ? 's' : ''} com ${delay} segundo${delay > 1 ? 's' : ''} de intervalo entre cada publicação.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Publicar', onPress: executePosting },
      ]
    );
  };

  const executePosting = async () => {
    setIsPosting(true);
    setPostStatus({ current: 0, total: selectedGroups.length, success: 0, failed: 0 });

    const accessToken = 'MANUAL_ACCESS_TOKEN'; // Em produção, usar o token do usuário

    for (let i = 0; i < selectedGroups.length; i++) {
      const group = selectedGroups[i];
      
      setPostStatus(prev => prev ? { ...prev, current: i + 1 } : null);

      const success = await FacebookService.postToGroup(
        group.id,
        accessToken,
        message,
        image || undefined,
        video || undefined
      );

      setPostStatus(prev => prev ? {
        ...prev,
        success: prev.success + (success ? 1 : 0),
        failed: prev.failed + (success ? 0 : 1),
      } : null);

      if (i < selectedGroups.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }

    setIsPosting(false);
    Alert.alert(
      'Concluído',
      `Publicação concluída!\nSucesso: ${postStatus?.success}\nFalhas: ${postStatus?.failed}`,
      [{ text: 'OK', onPress: () => {
        setPostStatus(null);
        setMessage('');
        setImage(null);
        setVideo(null);
      }}]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar Publicação</Text>
        <Text style={styles.subtitle}>
          {selectedGroups.length} grupo{selectedGroups.length !== 1 ? 's' : ''} selecionado{selectedGroups.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Mensagem</Text>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Escreva sua mensagem aqui..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Mídia</Text>
        <View style={styles.mediaButtons}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <Text style={styles.mediaButtonText}>📷 Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
            <Text style={styles.mediaButtonText}>🎥 Vídeo</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeButton} onPress={removeMedia}>
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {video && (
          <View style={styles.mediaPreview}>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoText}>🎬 Vídeo selecionado</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={removeMedia}>
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Intervalo entre publicações (segundos)</Text>
        <View style={styles.delayContainer}>
          <TouchableOpacity
            style={styles.delayButton}
            onPress={() => setDelay(Math.max(1, delay - 1))}
          >
            <Text style={styles.delayButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.delayValue}>{delay}s</Text>
          <TouchableOpacity
            style={styles.delayButton}
            onPress={() => setDelay(delay + 1)}
          >
            <Text style={styles.delayButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          Recomendado: 5-10 segundos para evitar bloqueios
        </Text>

        {isPosting && postStatus && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#1877f2" />
            <Text style={styles.statusText}>
              Publicando em {postStatus.current}/{postStatus.total}
            </Text>
            <Text style={styles.statusDetail}>
              ✓ {postStatus.success} | ✕ {postStatus.failed}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.postButton, isPosting && styles.postButtonDisabled]}
          onPress={startPosting}
          disabled={isPosting}
        >
          <Text style={styles.postButtonText}>
            {isPosting ? 'Publicando...' : '🚀 Iniciar Publicação'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1877f2',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#333',
  },
  mediaPreview: {
    marginTop: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  videoPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  delayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  delayButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  delayValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 32,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  statusDetail: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  postButton: {
    backgroundColor: '#42b72a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
