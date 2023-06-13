import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Stack from './src/stack/Stack';
import CameraScreen from './src/screens/CameraScreen';
import SearchScreen from './src/screens/SearchScreen';
import MapScreen from './src/screens/MapScreen';
import ChatScreen from './src/screens/ChatScreen';
import LibraryScreen from './src/screens/LibraryScreen';

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Map' component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Chat' component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Library' component={LibraryScreen} options={{ headerShown: false }} />
        <Stack.Screen name='Search' component={SearchScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
