import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GroupItem } from '../components/GroupItem';
import { FacebookGroup } from '../types';

interface GroupsScreenProps {
  navigation: any;
  route: any;
}

export const GroupsScreen: React.FC<GroupsScreenProps> = ({ navigation, route }) => {
  const { groups, loadGroups, toggleGroupSelection, selectAllGroups, deselectAllGroups } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user] = useState(route.params?.user || null);

  useEffect(() => {
    loadGroups();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadGroups();
    setIsRefreshing(false);
  };

  const selectedCount = groups.filter(g => g.selected).length;

  const handleContinue = () => {
    if (selectedCount === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um grupo para continuar.');
      return;
    }
    navigation.navigate('Post');
  };

  const renderGroup = ({ item }: { item: FacebookGroup }) => (
    <GroupItem group={item} onToggle={() => toggleGroupSelection(item.id)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecione os Grupos</Text>
        <Text style={styles.subtitle}>
          {selectedCount} grupo{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={selectAllGroups}>
          <Text style={styles.actionButtonText}>Selecionar Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={deselectAllGroups}>
          <Text style={styles.actionButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#1877f2" />
          <Text style={styles.emptyText}>Carregando grupos...</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#1877f2']} />
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            Continuar ({selectedCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  actions: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1877f2',
  },
  actionButtonText: {
    color: '#1877f2',
    fontWeight: '500',
  },
  list: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    backgroundColor: '#42b72a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
