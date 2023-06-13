import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView } from 'react-native';
import { StyleSheet } from 'react-native';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = () => {
  return <SafeAreaView style={styles.container}></SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ChatScreen;
