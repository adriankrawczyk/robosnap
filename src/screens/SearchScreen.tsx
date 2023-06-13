import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, View, TextInput, StyleSheet, StatusBar } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
const statusBarHeight = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const SearchScreen: React.FC<SearchScreenProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <MaterialCommunityIcons name='magnify' size={20} color='#888' style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder='Search for friends' placeholderTextColor='#888' autoFocus />
        <MaterialCommunityIcons name='close' size={20} color='#888' style={styles.closeIcon} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchBarContainer: {
    marginTop: statusBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  closeIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
});

export default SearchScreen;
