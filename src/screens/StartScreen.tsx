import React, { useContext, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { db } from '../firebase/firebase';
import { ref, set, get } from 'firebase/database';
import { UserContext } from '../../App';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

type StartScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const StartScreen: React.FC<StartScreenProps> = (props) => {
  const { setUsername } = useContext(UserContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const retrieveCredentials = async () => {
      try {
        const savedUsername = await SecureStore.getItemAsync('username');
        const savedPassword = await SecureStore.getItemAsync('password');
        if (savedUsername && savedPassword) {
          setUsername(savedUsername);
          props.navigation.push('Camera');
          // Perform login with saved credentials
        }
      } catch (error) {
        console.error('Error retrieving credentials from storage:', error);
      }
    };

    retrieveCredentials();
  }, []);
  const handleLogin = async () => {
    if (name.length === 0 || password.length === 0) return;
    const userRef = ref(db, `Users/${name}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === password) {
          // Password matches, save credentials and navigate to camera screen
          await SecureStore.setItemAsync('username', name);
          await SecureStore.setItemAsync('password', password);
          setUsername(name);
          props.navigation.push('Camera');
        } else {
          Alert.alert('Incorrect Password', 'Please enter the correct password.');
        }
      } else {
        Alert.alert('User Not Found', 'The entered user does not exist.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read user data. Please try again later.');
      console.error('Error reading user data:', error);
    }
  };

  const handleRegister = async () => {
    if (name.length === 0 || password.length === 0) return;
    const userRef = ref(db, `Users/${name}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        Alert.alert('User Already Exists', 'The entered user already exists.');
      } else {
        // User does not exist, register new user
        const userData = {
          name: name,
          password: password,
          friends: [{ name: 'Default' }],
        };
        await set(userRef, userData);
        Alert.alert('Registration Successful', 'You have successfully registered.');

        // Automatically log in after registration

        handleLogin();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register user. Please try again later.');
      console.error('Error registering user:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TextInput style={styles.input} placeholder='Name' placeholderTextColor='#fff' keyboardType='email-address' autoCapitalize='none' value={name} onChangeText={(text) => setName(text)} />
        <TextInput style={styles.input} placeholder='Password' placeholderTextColor='#fff' secureTextEntry autoCapitalize='none' value={password} onChangeText={(text) => setPassword(text)} />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  content: {
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default StartScreen;
