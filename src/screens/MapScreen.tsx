import React, { useEffect, useState, useContext } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, StyleSheet, ScrollView, View, ActivityIndicator, Image } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ref, getDatabase, onValue } from 'firebase/database';
import { UserContext } from '../../App';
import ModalComponent from '../components/ModalComponent';

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Map'>;

interface Robot {
  name: string;
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC<MapScreenProps> = (props) => {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [robots, setRobots] = useState<Robot[]>([]);
  const { username, setCurrentChatFriend } = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [clickedRobot, setClickedRobot] = useState('');
  const onCancelModal = () => {
    setModalVisible(false);
  };
  const onActionModal = () => {
    setCurrentChatFriend(clickedRobot);
    props.navigation.push('Chat');
  };
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        props.navigation.push('Camera');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const currentRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 2,
        longitudeDelta: 2,
      };
      setRegion(currentRegion);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    const fetchRobots = () => {
      const db = getDatabase();
      const usersRef = ref(db, 'Users');

      onValue(usersRef, (snapshot) => {
        const usersData: { [key: string]: { name: string; friends?: { [key: string]: { name: string; latitude: number; longitude: number } } } } = snapshot.val();
        if (usersData) {
          const currentUser = Object.values(usersData).find((user) => user.name === username);

          if (currentUser && currentUser.friends) {
            const friendKeys = Object.keys(currentUser.friends);
            const friendsList = friendKeys.map((key) => ({
              latitude: currentUser.friends![key].latitude,
              longitude: currentUser.friends![key].longitude,
              name: currentUser.friends![key].name,
            }));
            setRobots(friendsList);
          }
        }
      });
    };

    fetchRobots();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='white' />
          </View>
        ) : region ? (
          <MapView style={styles.map} region={region}>
            <Marker
              onPress={() => {
                setModalVisible(true);
                setClickedRobot(username);
              }}
              coordinate={region}>
              <View style={styles.customMarker}>
                <Image source={{ uri: `https://robohash.org/${username}.png?size=100x100` }} style={styles.markerImage} />
              </View>
            </Marker>

            {robots.map((robot, index) => (
              <Marker
                onPress={() => {
                  setModalVisible(true);
                  setClickedRobot(robot.name);
                }}
                key={index}
                coordinate={{
                  latitude: robot.latitude,
                  longitude: robot.longitude,
                }}>
                <View style={styles.customMarker}>
                  <Image source={{ uri: `https://robohash.org/${robot.name}.png?size=100x100` }} style={styles.markerImage} />
                </View>
              </Marker>
            ))}
          </MapView>
        ) : null}
      </ScrollView>
      <ModalComponent visible={modalVisible} onCancel={onCancelModal} onAction={onActionModal} actionText={'Chat'} setModalVisible={setModalVisible} hideAction={clickedRobot === username} modalText={clickedRobot === username ? `That is you, ${username}` : `That is your friend ${clickedRobot}`} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  mapContainer: {
    flexGrow: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(70, 70, 70,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});

export default MapScreen;
