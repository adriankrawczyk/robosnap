import * as React from 'react';
import { TouchableOpacity, View, StyleSheet, SafeAreaView, StatusBar, FlatList, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImageManipulator from 'expo-image-manipulator';
import { useIsFocused } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../../App';
import { useContext } from 'react';
import ModalComponent from '../components/ModalComponent';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import 'firebase/storage';
import { getStorage, ref, uploadString, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase/firebase';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

import '@firebase/polyfill';
import { decode } from 'base-64';

if (typeof atob === 'undefined') {
  global.atob = decode;
}
type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;
const statusBarHeight = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const CameraScreen: React.FC<CameraScreenProps> = (props) => {
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera>(null);
  const [photoShot, setPhotoShot] = useState(Boolean);
  const [photoUri, setPhotoUri] = useState<string>('');
  const [savedImages, setSavedImages] = useState<(string | undefined)[]>([]);
  const isFocused = useIsFocused();
  const { username, setUsername } = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);

  useFocusEffect(() => {
    const onBackPress = () => {
      if (photoShot) {
        setPhotoShot(false);
      }
      return true; // Return `true` to block going back
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  });

  useEffect(() => {
    (async () => {
      requestPermission();
    })();
  }, []);

  useEffect(() => {
    if (!isFocused) {
      // Reset camera state when the screen loses focus
      setPhotoShot(false);
      setPhotoUri('');
    }
  }, [isFocused]);

  const toggleFlashlight = () => {
    setFlashMode((current) => (current === FlashMode.off ? FlashMode.torch : FlashMode.off));
  };
  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('username');
      await SecureStore.deleteItemAsync('password');
      setUsername('');
      props.navigation.push('Home');
      Alert.alert('Logout Successful', 'You have been logged out.');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again later.');
      console.error('Error logging out:', error);
    }
  };
  async function takePhoto() {
    if (cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      if (uri) {
        let finalUri = uri;
        if (type === CameraType.front) {
          finalUri = await flipImage(uri);
        }
        setPhotoShot(true);
        setPhotoUri(finalUri);
      }
    }
  }
  async function flipImage(uri: string) {
    const manipResult = await ImageManipulator.manipulateAsync(uri, [{ flip: ImageManipulator.FlipType.Horizontal }]);
    return manipResult.uri;
  }
  const saveImage = async () => {
    if (photoSaved) return;

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${Date.now()}`);
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      });
      setPhotoSaved(true);
    } catch (error) {
      // Handle any errors that occur during the Firebase storage operation
      Alert.alert('Error', 'Failed to save image. Please try again later.');
      console.error('Error saving image:', error);
    }
  };

  if (permission && !permission.granted) {
    requestPermission();
  }

  type BottomPanelItem = {
    id: number;
    name: string;
    screen: keyof RootStackParamList;
  };

  const bottomPanelData: BottomPanelItem[] = [
    { id: 1, name: 'map-marker-outline', screen: 'Map' },
    { id: 2, name: 'chat-outline', screen: 'Friends' },
    { id: 3, name: 'image-outline', screen: 'Library' },
    { id: 4, name: 'magnify', screen: 'Search' },
  ];

  const renderItem = ({ item }: { item: BottomPanelItem }) => {
    return (
      <TouchableOpacity onPress={() => props.navigation.push(item.screen)}>
        <MaterialCommunityIcons name={item.name} size={40} color='black' />
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.camera}>
        {photoShot ? (
          <>
            <Image style={styles.photo} source={{ uri: photoUri }} />
            <TouchableOpacity
              style={styles.exitPhoto}
              onPress={() => {
                setPhotoSaved(false);
                setPhotoShot(false);
              }}>
              <MaterialCommunityIcons name={'close'} size={40} color='black' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
              <MaterialCommunityIcons name={photoSaved ? 'check' : 'content-save-outline'} size={40} color={'black'} />
            </TouchableOpacity>
          </>
        ) : (
          isFocused && (
            <Camera ref={cameraRef} type={type} flashMode={flashMode} style={{ flex: 1 }} ratio={'16:9'}>
              <TouchableOpacity style={styles.recordCircle} onPress={takePhoto}></TouchableOpacity>
              <ModalComponent visible={modalVisible} onCancel={() => setModalVisible(false)} onAction={handleLogout} actionText='Logout' modalText={`Username: ${username}`} setModalVisible={setModalVisible} />
              <TouchableOpacity style={styles.profile} onPress={() => setModalVisible(true)}>
                <Image style={styles.profileImage} source={{ uri: `https://robohash.org/${username}.png?size=100x100` }} />
              </TouchableOpacity>
            </Camera>
          )
        )}
      </View>
      {photoShot ? (
        <View></View>
      ) : (
        <View style={styles.rightPanel}>
          <TouchableOpacity onPress={toggleCameraType}>
            <MaterialCommunityIcons name='camera-flip-outline' size={30} color='black' />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlashlight}>
            <MaterialCommunityIcons name={flashMode === FlashMode.off ? 'flash-off' : 'flash'} size={30} color='black' />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.bottomPanel}>
        <FlatList contentContainerStyle={styles.bottomList} data={bottomPanelData} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    flex: 1,
    backgroundColor: 'black',
  },
  profile: {
    width: 50,
    height: 50,
    left: 20,
    top: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(70, 70, 70, 0.5)',

    position: 'absolute',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  saveButton: { width: 50, height: 50, backgroundColor: 'rgba(70, 70, 70, 0.5)', bottom: 20, left: 20, position: 'absolute', borderRadius: 20, flex: 1, alignItems: 'center', justifyContent: 'center' },
  exitPhoto: { position: 'absolute', left: 20, top: 20 },
  photo: {
    flex: 1,
  },
  recordCircle: {
    width: 100,
    height: 100,
    borderColor: 'white',
    borderWidth: 4,
    borderRadius: 50,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 10,
  },
  camera: {
    marginTop: statusBarHeight,
    flex: 0.95,
    borderRadius: 20,
    overflow: 'hidden',
  },
  rightPanel: {
    paddingTop: 5,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    position: 'absolute',
    top: statusBarHeight + 40,
    right: 20,
    width: 40,
    height: 100,
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    borderRadius: 10,
  },

  bottomList: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  bottomPanel: {
    width: '95%',
    height: '7%',
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    borderRadius: 50,
  },
  bottomButton: {
    width: 50,
    height: '70%',
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
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CameraScreen;
