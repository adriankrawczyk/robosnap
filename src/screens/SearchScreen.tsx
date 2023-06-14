import React, { useContext, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, View, TextInput, StyleSheet, StatusBar, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../firebase/firebase';
import { ref, get, push } from 'firebase/database';
import { UserContext } from '../../App';

type Robot = {
  name: string;
};

type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
const statusBarHeight = StatusBar.currentHeight || 0;

const SearchScreen: React.FC<SearchScreenProps> = () => {
  const { username } = useContext(UserContext);
  const [robotList, setRobotList] = useState<Robot[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [friends, setFriends] = useState<string[]>([]);
  const [disabledButtons, setDisabledButtons] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const robotsSnapshot = await get(ref(db, '/Robots'));
        if (robotsSnapshot.exists()) {
          const robotsData = robotsSnapshot.val();
          const dataArray = Object.values(robotsData) as Robot[];

          const friendsSnapshot = await get(ref(db, `Users/${username}/friends`));
          if (!friendsSnapshot.exists()) return;

          const friendsData = friendsSnapshot.val() as Record<string, Robot>;
          const friendsList = Object.values(friendsData).map((friend) => friend.name);

          setFriends(friendsList);
          setRobotList(dataArray);
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error('Error reading data:', error);
      }
    };

    fetchData();
  }, [searchQuery, username]);
  const addToFriends = async (item: Robot) => {
    try {
      const userRef = ref(db, `Users/${username}/friends`);
      const pushPromise = push(userRef, { name: item.name });
      setFriends((prevFriends) => [...prevFriends, item.name]);
    } catch (error) {
      console.error('Error adding robot to friends:', error);
    }
  };

  const renderRobot = ({ item }: { item: Robot }) => {
    const isFriend = friends.includes(item.name);
    const isButtonDisabled = disabledButtons.includes(item.name);

    return (
      <View style={styles.robotItem}>
        <View style={styles.robotImageContainer}>
          <Image source={{ uri: `https://robohash.org/${item.name}?size=200x200` }} style={styles.robotImage} />
        </View>
        <View style={styles.robotInfo}>
          <Text style={styles.robotName}>{item.name}</Text>
        </View>
        {!isFriend ? (
          <TouchableOpacity style={styles.addButton} onPress={() => addToFriends(item)} disabled={isButtonDisabled}>
            <MaterialCommunityIcons name='plus' size={24} color={isButtonDisabled ? 'gray' : 'white'} />
          </TouchableOpacity>
        ) : (
          <View style={styles.addButtonDisabled}>
            <MaterialCommunityIcons name='plus' size={24} color='gray' />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <MaterialCommunityIcons name='magnify' size={20} color='#888' style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder='Search for robots' placeholderTextColor='#FFF' autoFocus onChangeText={setSearchQuery} />
        <MaterialCommunityIcons name='close' size={20} color='#888' style={styles.closeIcon} />
      </View>
      <FlatList style={styles.robotList} data={robotList} renderItem={renderRobot} keyExtractor={(item, index) => index.toString()} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  robotList: {
    marginTop: 20,
    flex: 1,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    opacity: 0.5,
  },
  robotItem: {
    marginBottom: 20,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
  },
  robotImage: {
    width: '100%',
    height: '100%',
  },
  robotInfo: {
    flex: 1,
    marginLeft: 16,
  },
  robotName: {
    fontSize: 16,
    color: 'white',
  },
  searchBarContainer: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
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
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default SearchScreen;
