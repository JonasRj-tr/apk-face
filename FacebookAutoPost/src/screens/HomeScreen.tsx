import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  Linking,
  LogBox,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Automation, delay } from '../services/Automation';

interface Group {
  name: string;
  selected: boolean;
}

interface PostConfig {
  text: string;
  image: string | null;
  delay: number;
}

LogBox.ignoreLogs(['Non-serializable values']);

export default function HomeScreen() {
  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const [isCheckingService, setIsCheckingService] = useState(true);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [log, setLog] = useState<string[]>(['Aguardando inicialização...']);
  const [postConfig, setPostConfig] = useState<PostConfig>({
    text: '',
    image: null,
    delay: 5,
  });
  const [groups, setGroups] = useState<Group[]>([
    { name: 'Grupo 1 - Testes', selected: true },
    { name: 'Grupo 2 - Marketing', selected: false },
    { name: 'Grupo 3 - Vendas', selected: false },
    { name: 'Grupo 4 - Projetos', selected: false },
    { name: 'Grupo 5 - Comunidade', selected: false },
  ]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);

  const addLog = useCallback((message: string) => {
    setLog(prev => [...prev.slice(-50), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  useEffect(() => {
    checkService();
    loadSavedConfig();
    
    return () => {
      Automation.removeListeners();
    };
  }, []);

  const checkService = async () => {
    setIsCheckingService(true);
    try {
      const enabled = await Automation.isServiceEnabled();
      setIsServiceEnabled(enabled);
      if (enabled) {
        addLog('✅ Serviço de acessibilidade ATIVO');
      } else {
        addLog('⚠️ Serviço de acessibilidade INATIVO');
        addLog('📱 Modo simulador ativado');
        setIsSimulatorMode(true);
      }
    } catch (e: any) {
      addLog('❌ Erro ao verificar serviço');
      addLog('📱 Ativando modo simulador');
      setIsSimulatorMode(true);
    }
    setIsCheckingService(false);
  };

  const loadSavedConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem('postConfig');
      if (saved) {
        const config = JSON.parse(saved);
        setPostConfig(config);
        addLog('Configuração carregada');
      }
    } catch (e) {
      addLog('Erro ao carregar configuração');
    }
  };

  const saveConfig = async () => {
    try {
      await AsyncStorage.setItem('postConfig', JSON.stringify(postConfig));
      addLog('✅ Configuração salva');
      Alert.alert('Sucesso', 'Configuração salva com sucesso!');
    } catch (e) {
      addLog('❌ Erro ao salvar configuração');
    }
  };

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
      setPostConfig(prev => ({ ...prev, image: result.assets[0].uri }));
      addLog('✅ Imagem selecionada');
    }
  };

  const toggleGroupSelection = (name: string) => {
    setGroups(prev => prev.map(g => 
      g.name === name ? { ...g, selected: !g.selected } : g
    ));
  };

  const selectAllGroups = () => {
    setGroups(prev => prev.map(g => ({ ...g, selected: true })));
  };

  const deselectAllGroups = () => {
    setGroups(prev => prev.map(g => ({ ...g, selected: false })));
  };

  const getSelectedGroups = () => {
    return groups.filter(g => g.selected).map(g => g.name);
  };

  const openAccessibilitySettings = () => {
    Automation.openAccessibilitySettings();
  };

  const openFacebook = async () => {
    const facebookPackage = 'com.facebook.katana';
    const fbLitePackage = 'com.facebook.lite';
    
    try {
      await Linking.openURL('fb://');
      addLog('📱 Abrindo Facebook...');
    } catch (e) {
      addLog('❌ Facebook não instalado');
      Alert.alert('Erro', 'Por favor, instale o aplicativo Facebook.');
    }
    await delay(2000);
  };

  const runAutomation = async () => {
    const selected = getSelectedGroups();
    
    if (!postConfig.text.trim() && !postConfig.image) {
      Alert.alert('Erro', 'Adicione um texto ou imagem para postar.');
      return;
    }

    if (selected.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um grupo.');
      return;
    }

    if (isSimulatorMode) {
      runSimulator(selected);
      return;
    }

    setIsAutomationRunning(true);
    addLog('=== 🚀 INICIANDO AUTOMAÇÃO ===');
    addLog(`Grupos: ${selected.join(', ')}`);
    addLog(`Delay: ${postConfig.delay}s`);

    try {
      for (const groupName of selected) {
        addLog(`\n📤 Postando em: ${groupName}`);
        
        // Abrir Facebook
        await openFacebook();
        
        // Navegar para grupos
        addLog('👥 Navegando para Grupos...');
        await Automation.clickText('Grupos');
        await delay(2000);
        
        // Buscar grupo
        addLog(`🔍 Buscando: ${groupName}`);
        await Automation.clickDescription('Pesquisar');
        await delay(1000);
        await Automation.inputText('Pesquisar', groupName);
        await delay(1500);
        
        // Clicar no grupo
        const found = await Automation.waitForElement(groupName, 5);
        if (found) {
          await Automation.clickText(groupName);
        } else {
          addLog('⚠️ Grupo não encontrado na lista');
        }
        await delay(2000);
        
        // Criar postagem
        addLog('✍️ Criando postagem...');
        
        // Tentar diferentes formas de criar post
        let postCreated = await Automation.clickText('Escrever algo...');
        if (!postCreated) {
          postCreated = await Automation.clickText('Publicar');
        }
        if (!postCreated) {
          await Automation.clickPosition(540, 1500);
        }
        await delay(1500);
        
        // Digitar conteúdo
        addLog('📝 Digitando mensagem...');
        const typed = await Automation.inputText('Escreva algo...', postConfig.text);
        if (!typed) {
          // Tentar em outros campos
          await Automation.clickPosition(540, 800);
          await delay(500);
        }
        await delay(1000);
        
        // Publicar
        addLog('✅ Publicando...');
        await Automation.clickText('Publicar');
        await delay(2000);
        
        addLog(`✅ Concluído em ${groupName}`);
        
        // Delay entre postagens
        if (selected.indexOf(groupName) < selected.length - 1) {
          addLog(`⏳ Aguardando ${postConfig.delay}s...`);
          await delay(postConfig.delay * 1000);
        }
      }

      addLog('\n=== ✅ AUTOMAÇÃO CONCLUÍDA ===');
      Alert.alert('Sucesso', 'Todas as postagens foram concluídas!');
    } catch (error: any) {
      addLog(`\n❌ ERRO: ${error.message}`);
      Alert.alert('Erro', `Automação falhou: ${error.message}`);
    }

    setIsAutomationRunning(false);
  };

  const runSimulator = async (selected: string[]) => {
    setIsAutomationRunning(true);
    addLog('=== 📱 MODO SIMULADOR ===');
    addLog('Este modo simula a automação para testes');
    addLog(`Grupos: ${selected.join(', ')}`);
    addLog(`Delay: ${postConfig.delay}s`);
    addLog(`Mensagem: "${postConfig.text.substring(0, 30)}..."`);
    
    try {
      for (let i = 0; i < selected.length; i++) {
        const groupName = selected[i];
        addLog(`\n[${i + 1}/${selected.length}] 📤 ${groupName}`);
        
        addLog('  📱 Abrindo Facebook');
        await delay(800);
        
        addLog('  👥 Navegando para Grupos');
        await delay(800);
        
        addLog(`  🔍 Buscando "${groupName}"`);
        await delay(600);
        
        addLog('  📂 Abrindo grupo');
        await delay(800);
        
        addLog('  ✍️ Criando postagem');
        await delay(600);
        
        addLog('  📝 Digitando mensagem');
        await delay(500);
        
        if (postConfig.image) {
          addLog('  🖼️ Adicionando imagem');
          await delay(500);
        }
        
        addLog('  ✅ Publicando');
        await delay(500);
        
        addLog(`  ✓ Concluído!`);
        
        if (i < selected.length - 1) {
          addLog(`  ⏳ Aguardando ${postConfig.delay}s...`);
          await delay(postConfig.delay * 1000);
        }
      }

      addLog('\n=== ✅ SIMULAÇÃO CONCLUÍDA ===');
      addLog('💡 Para funcionar no dispositivo real:');
      addLog('   1. Ative o Accessibility Service');
      addLog('   2. Instale o app no Android');
      
      Alert.alert(
        'Simulação Concluída',
        'A simulação foi concluída!\n\nPara usar no dispositivo real:\n1. Ative o Accessibility Service nas configurações do Android\n2. Compile o APK com módulo nativo'
      );
    } catch (error: any) {
      addLog(`❌ ERRO: ${error.message}`);
    }
    
    setIsAutomationRunning(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Facebook Auto Post</Text>
        <Text style={styles.headerSubtitle}>Automação via Accessibility Service</Text>
        {isSimulatorMode && (
          <View style={styles.simulatorBadge}>
            <Text style={styles.simulatorText}>MODO SIMULADOR</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Status do Serviço</Text>
        {isCheckingService ? (
          <ActivityIndicator color="#1877f2" />
        ) : (
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, isServiceEnabled ? styles.statusActive : styles.statusInactive]} />
            <Text style={styles.statusText}>
              {isServiceEnabled ? 'ATIVO' : 'INATIVO'}
            </Text>
            <TouchableOpacity 
              style={[styles.button, !isServiceEnabled && styles.buttonWarning]} 
              onPress={openAccessibilitySettings}
            >
              <Text style={styles.buttonText}>
                {isServiceEnabled ? 'Configurações' : 'Ativar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✍️ Conteúdo da Postagem</Text>
        <TextInput
          style={styles.textInput}
          value={postConfig.text}
          onChangeText={(text) => setPostConfig(prev => ({ ...prev, text }))}
          placeholder="Digite o texto da postagem..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>
            {postConfig.image ? '✅ Imagem Selecionada' : '🖼️ Adicionar Imagem'}
          </Text>
        </TouchableOpacity>
        
        {postConfig.image && (
          <Image source={{ uri: postConfig.image }} style={styles.previewImage} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          👥 Grupos ({getSelectedGroups().length} selecionado{getSelectedGroups().length !== 1 ? 's' : ''})
        </Text>
        <View style={styles.groupActions}>
          <TouchableOpacity style={styles.smallButton} onPress={selectAllGroups}>
            <Text style={styles.smallButtonText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={deselectAllGroups}>
            <Text style={styles.smallButtonText}>Limpar</Text>
          </TouchableOpacity>
        </View>
        
        {groups.map((group) => (
          <TouchableOpacity
            key={group.name}
            style={[styles.groupItem, group.selected && styles.groupItemSelected]}
            onPress={() => toggleGroupSelection(group.name)}
          >
            <View style={[styles.checkbox, group.selected && styles.checkboxSelected]}>
              {group.selected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.groupName}>{group.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏱️ Intervalo entre Publicações</Text>
        <View style={styles.delayRow}>
          <TouchableOpacity 
            style={styles.delayButton} 
            onPress={() => setPostConfig(prev => ({ ...prev, delay: Math.max(1, prev.delay - 1) }))}
          >
            <Text style={styles.delayButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.delayValue}>{postConfig.delay}s</Text>
          <TouchableOpacity 
            style={styles.delayButton} 
            onPress={() => setPostConfig(prev => ({ ...prev, delay: prev.delay + 1 }))}
          >
            <Text style={styles.delayButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Recomendado: 5-10 segundos</Text>
      </View>

      <TouchableOpacity
        style={[styles.startButton, isAutomationRunning && styles.buttonDisabled]}
        onPress={runAutomation}
        disabled={isAutomationRunning}
      >
        {isAutomationRunning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>
            {isSimulatorMode ? '🚀 INICIAR SIMULAÇÃO' : '🚀 INICIAR AUTOMAÇÃO'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Log de Atividades</Text>
        <View style={styles.logContainer}>
          {log.map((entry, index) => (
            <Text key={index} style={styles.logEntry}>{entry}</Text>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
        <Text style={styles.saveButtonText}>💾 Salvar Configuração</Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Como Ativar o Serviço</Text>
        <Text style={styles.infoText}>
          1. Configurações → Acessibilidade{'\n'}
          2. FacebookAutoPost{'\n'}
          3. Ativar o serviço{'\n'}
          4. Permitir acesso
        </Text>
      </View>
    </ScrollView>
  );
}

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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 4,
  },
  simulatorBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  simulatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#4caf50',
  },
  statusInactive: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  imageButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#1877f2',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
  },
  groupActions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  groupItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1877f2',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1877f2',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1877f2',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  groupName: {
    fontSize: 14,
    color: '#333',
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  smallButtonText: {
    color: '#333',
    fontSize: 12,
  },
  delayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    marginHorizontal: 24,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonWarning: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  startButton: {
    backgroundColor: '#42b72a',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  logContainer: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    maxHeight: 180,
  },
  logEntry: {
    color: '#0f0',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  saveButton: {
    backgroundColor: '#1877f2',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff3cd',
    margin: 12,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 20,
  },
});
