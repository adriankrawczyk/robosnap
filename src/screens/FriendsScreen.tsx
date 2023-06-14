import React, { useContext, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, View, StyleSheet, StatusBar, FlatList, Text, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { db } from '../firebase/firebase';
import { ref, get, remove } from 'firebase/database';
import { UserContext } from '../../App';
import ModalComponent from '../components/Modal';

type Robot = {
  name: string;
};

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Friends'>;
const statusBarHeight = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const FriendsScreen: React.FC<ChatScreenProps> = () => {
  const { username } = useContext(UserContext);
  const [friendList, setFriendList] = useState<Robot[]>([]); // State to store the friend list data
  const [selectedFriend, setSelectedFriend] = useState<Robot | null>(null); // State to store the selected friend for deletion
  const [modalVisible, setModalVisible] = useState(false); // State to control the visibility of the modal
  const onCancelModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const readData = async () => {
      const userRef = ref(db, `Users/${username}/friends`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dataArray = Object.values(data) as Robot[];

          setFriendList(dataArray);
        } else {
          console.log('No friends found');
        }
      } catch (error) {
        console.error('Error reading data:', error);
      }
    };

    readData();
  }, [username]);

  const confirmDeleteFriend = (friend: Robot) => {
    setSelectedFriend(friend);
    setModalVisible(true);
  };

  const deleteFriend = async () => {
    if (selectedFriend) {
      const friendName = selectedFriend.name;
      const userRef = ref(db, `Users/${username}/friends`);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const friendToRemove = Object.entries(data).find(([key, friend]: [string, unknown]) => (friend as Robot).name === friendName);
          if (friendToRemove) {
            const [key] = friendToRemove;
            const friendRef = ref(db, `Users/${username}/friends/${key}`);
            await remove(friendRef);
            setFriendList((prevFriendList) => prevFriendList.filter((friend) => (friend as Robot).name !== friendName));
            setModalVisible(false);
          }
        }
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    }
  };

  const renderFriend = ({ item }: { item: Robot }) => {
    return (
      <View style={styles.friendItem}>
        <View style={styles.friendImageContainer}>
          <Image source={{ uri: `https://robohash.org/${item.name}?size=200x200` }} style={styles.friendImage} />
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
        </View>
        {friendList.length > 1 && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteFriend(item)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Robo-Friends</Text>
      </View>
      <FlatList style={styles.friendList} data={friendList} renderItem={renderFriend} keyExtractor={(item, index) => index.toString()} />
      <ModalComponent visible={modalVisible} onCancel={onCancelModal} onAction={deleteFriend} actionText={'Delete'} setModalVisible={setModalVisible} modalText={'Are you sure you want to delete this friend?'} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    marginTop: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendList: {
    marginTop: 20,
    flex: 1,
  },
  friendItem: {
    marginBottom: 20,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
  },
  friendImage: {
    width: '100%',
    height: '100%',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
  },
  friendName: {
    fontSize: 16,
    color: 'white',
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',

    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgb(30, 30, 30)',
    borderColor: 'rgb(70, 70, 70)',
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: '80%',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FriendsScreen;
