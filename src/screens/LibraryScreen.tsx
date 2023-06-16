import React, { useContext, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';

type LibraryScreenProps = NativeStackScreenProps<RootStackParamList, 'Library'>;

const LibraryScreen: React.FC<LibraryScreenProps> = (props) => {
  return <SafeAreaView style={styles.container}></SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default LibraryScreen;
