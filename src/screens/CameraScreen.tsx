import * as React from 'react';
import { TouchableOpacity, View, StyleSheet, SafeAreaView, StatusBar, FlatList, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { Camera, CameraType } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImageManipulator from 'expo-image-manipulator';
import { useIsFocused } from '@react-navigation/native';

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
const statusBarHeight = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

const CameraScreen: React.FC<CameraScreenProps> = (props) => {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera>(null);
  const [photoShot, setPhotoShot] = useState(Boolean);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [savedImages, setSavedImages] = useState<(string | undefined)[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      requestPermission();
    })();
  }, []);

  useEffect(() => {
    if (!isFocused) {
      // Reset camera state when the screen loses focus
      setPhotoShot(false);
      setPhotoUri(undefined);
    }
  }, [isFocused]);

  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      let finalUri = uri;

      if (type === CameraType.front) {
        finalUri = await flipImage(uri);
      }

      setPhotoShot(true);
      setPhotoUri(finalUri);
    }
  }

  async function flipImage(uri: string) {
    const manipResult = await ImageManipulator.manipulateAsync(uri, [{ flip: ImageManipulator.FlipType.Horizontal }]);
    return manipResult.uri;
  }

  const saveImage = () => {
    const newArray = [...savedImages, photoUri];
    setSavedImages(newArray);
    console.log(savedImages);
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
    { id: 2, name: 'chat-outline', screen: 'Chat' },
    { id: 3, name: 'image-outline', screen: 'Library' },
    { id: 4, name: 'magnify', screen: 'Search' },
  ];

  const renderItem = ({ item }: { item: BottomPanelItem }) => (
    <TouchableOpacity onPress={() => props.navigation.push(item.screen)}>
      <MaterialCommunityIcons name={item.name} size={40} color='black' />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.camera}>
        {photoShot ? (
          <>
            <Image style={styles.photo} source={{ uri: photoUri }} />
            <TouchableOpacity
              style={styles.exitPhoto}
              onPress={() => {
                setPhotoShot(false);
              }}>
              <MaterialCommunityIcons name={'close'} size={40} color='black' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
              <MaterialCommunityIcons name='content-save-outline' size={40} color='black' />
            </TouchableOpacity>
          </>
        ) : (
          isFocused && (
            <Camera ref={cameraRef} type={type} style={{ flex: 1 }} ratio={'16:9'}>
              <TouchableOpacity style={styles.recordCircle} onPress={takePhoto}></TouchableOpacity>
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
    flexDirection: 'column',
    position: 'absolute',
    top: statusBarHeight + 40,
    right: 20,
    width: 40,
    height: 200,
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
});

export default CameraScreen;
