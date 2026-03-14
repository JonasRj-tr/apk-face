import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { FacebookGroup } from '../types';

interface GroupItemProps {
  group: FacebookGroup;
  onToggle: () => void;
}

export const GroupItem: React.FC<GroupItemProps> = ({ group, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.container, group.selected && styles.selected]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {group.selected && <View style={styles.checkmark} />}
      </View>
      {group.picture ? (
        <Image source={{ uri: group.picture }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{group.name.charAt(0)}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>{group.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selected: {
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
  checkmark: {
    width: 14,
    height: 14,
    backgroundColor: '#1877f2',
    borderRadius: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});
