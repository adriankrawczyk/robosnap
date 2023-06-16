import React, { useState, useEffect, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { set, getDatabase, ref, push, onValue, off, get, update } from 'firebase/database';
import { app, db } from '../firebase/firebase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from '../../App';
import { useContext } from 'react';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = () => {
  type Message = {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
  };
  const { currentChatFriend, username } = useContext(UserContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList<Message>>(null);
  const [text, setText] = useState('');
  const scroll = () => {
    if (messages.length > 0 && flatListRef && flatListRef.current) {
      const speed = 50;
      const offset = messages.length * speed;
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  };
  useEffect(() => {
    const userRef = ref(db, `Users/${username}/friends`);
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const friendsData = snapshot.val();
          const matchingFriendKey = Object.keys(friendsData).find((key) => (friendsData[key] as { name: string }).name === currentChatFriend);

          if (matchingFriendKey) {
            const matchingFriend = friendsData[matchingFriendKey];

            if (!matchingFriend.chats) {
              const friendRef = ref(db, `Users/${username}/friends/${matchingFriendKey}/chats`);
              update(friendRef, { id: -1, text: '', timestamp: Date.now() }).catch((error) => {
                console.error('Error updating friend data:', error);
              });
            }
          } else {
            console.log('No friend with this name found');
          }
        } else {
          console.log('No friends found');
        }
      })
      .catch((error) => {
        console.error('Error reading data:', error);
      });
  }, []);

  useEffect(() => {
    const friendRef = ref(db, `Users/${username}/friends`);
    const chatListener = onValue(friendRef, (snapshot) => {
      if (snapshot.exists()) {
        const friendsData = snapshot.val();
        const matchingFriendKey = Object.keys(friendsData).find((key) => (friendsData[key] as { name: string }).name === currentChatFriend);

        if (matchingFriendKey) {
          const matchingFriend = friendsData[matchingFriendKey];

          if (matchingFriend.chats) {
            const chatData = matchingFriend.chats;
            const chatList: Message[] = Object.values(chatData);
            const sortedMessages = chatList.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(sortedMessages);
          } else {
            setMessages([]);
          }
        }
      }
    });

    return () => {
      off(friendRef, 'value', chatListener);
    };
  }, [currentChatFriend]);

  const sendMessage = () => {
    if (text.trim() !== '') {
      const userRef = ref(db, `Users/${username}/friends`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const friendsData = snapshot.val();
            const matchingFriendKey = Object.keys(friendsData).find((key) => (friendsData[key] as { name: string }).name === currentChatFriend);

            if (matchingFriendKey) {
              const matchingFriend = friendsData[matchingFriendKey];

              if (matchingFriend.chats) {
                const chatRef = ref(db, `Users/${username}/friends/${matchingFriendKey}/chats`);
                const newMessageRef = push(chatRef);
                const newMessageKey = newMessageRef.key;
                if (newMessageKey) {
                  set(newMessageRef, {
                    text: text.trim(),
                    sender: username,
                    timestamp: Date.now(),
                  });
                }
              }
            } else {
              console.log('No friend with this name found');
            }
          } else {
            console.log('No friends found');
          }
        })
        .catch((error) => {
          console.error('Error reading data:', error);
        });

      setText('');
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (!item || !item.text || !item.timestamp) {
      return null;
    }
    return (
      <View key={item.id} style={styles.messageContainer}>
        <Text style={styles.message}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.friendImageContainer}>
          <Image source={{ uri: `https://robohash.org/${currentChatFriend}?size=200x200` }} style={styles.friendImage} />
        </View>
        <Text style={styles.headerText}>{currentChatFriend}</Text>
      </View>
      {messages.length === 0 ? (
        <View>
          <Text>No messages yet.</Text>
        </View>
      ) : (
        <FlatList style={styles.messageList} ref={flatListRef} data={messages} renderItem={renderItem} keyExtractor={(item, index) => (item.timestamp ? item.timestamp.toString() : index.toString())} contentContainerStyle={{ flexGrow: 1 }} onContentSizeChange={scroll} onLayout={scroll} />
      )}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder='Type a message' placeholderTextColor='#888' />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <MaterialCommunityIcons name='send' size={24} color='white' />
        </TouchableOpacity>
      </View>
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
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  messageList: {
    marginTop: 20,
  },
  friendImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    marginRight: 10,
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
  message: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageContainer: {
    marginLeft: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
    padding: 5,
    color: 'white',
    height: 40,
  },
  sendButton: {
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    borderRadius: 50,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
