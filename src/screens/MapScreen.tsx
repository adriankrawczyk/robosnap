import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Map'>;

const MapScreen: React.FC<MapScreenProps> = () => {
  const [region, setRegion] = React.useState<Region | undefined>(undefined);

  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
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
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.mapContainer}>
        {region ? (
          <MapView style={styles.map} region={region}>
            <Marker coordinate={region} />
          </MapView>
        ) : null}
      </ScrollView>
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
});

export default MapScreen;
