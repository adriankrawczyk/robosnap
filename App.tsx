import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Stack from './src/stack/Stack';
import CameraScreen from './src/screens/CameraScreen';
import SearchScreen from './src/screens/SearchScreen';
import MapScreen from './src/screens/MapScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import StartScreen from './src/screens/StartScreen';
import FriendsScreen from './src/screens/FriendsScreen';

interface UserContextValue {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  friends: string[];
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
}

// Define initial values for the context
const initialUserContextValue: UserContextValue = {
  username: '',
  setUsername: () => {},
  friends: [],
  setFriends: () => {},
};

// Create a new context
const UserContext = React.createContext<UserContextValue>(initialUserContextValue);

function App() {
  // Define the state for the username and friends
  const [username, setUsername] = React.useState('');
  const [friends, setFriends] = React.useState<string[]>([]);

  // Provide a value to the context
  const contextValue: UserContextValue = {
    username,
    setUsername,
    friends,
    setFriends,
  };

  return (
    <UserContext.Provider value={contextValue}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name='Home' component={StartScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Camera' component={CameraScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Map' component={MapScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Friends' component={FriendsScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Library' component={LibraryScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Search' component={SearchScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}

export default App;
export { UserContext };
