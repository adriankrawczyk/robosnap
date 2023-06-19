import React, { useContext, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/params';
import { SafeAreaView, View, StyleSheet, FlatList, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { app } from '../firebase/firebase';
import { UserContext } from '../../App';

const windowWidth = Dimensions.get('window').width;

type LibraryScreenProps = NativeStackScreenProps<RootStackParamList, 'Library'>;

const getItemWidth = (imageCount: number) => {
  const numColumns = Math.min(imageCount, 4); // Display maximum 4 photos in a row
  return windowWidth / numColumns;
};

const LibraryScreen: React.FC<LibraryScreenProps> = (props) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { username } = useContext(UserContext);

  useEffect(() => {
    // Fetch images from Firebase Storage
    const fetchImages = async () => {
      try {
        setLoading(true);
        const storage = getStorage(app);
        const storageRef = ref(storage, username);
        const listResult = await listAll(storageRef);
        const downloadURLs = await Promise.all(listResult.items.map((itemRef) => getDownloadURL(itemRef)));
        setImages(downloadURLs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, [username]);

  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={[styles.imageContainer, { width: getItemWidth(images.length) * 0.85, height: getItemWidth(images.length) * 1.7 }]}>
        <Image style={styles.image} source={{ uri: item }} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Image Library</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='white' />
        </View>
      ) : images.length > 0 ? (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          numColumns={4} // Display maximum 4 photos in a row
          contentContainerStyle={styles.imageListContainer}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Images Found</Text>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageListContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  columnWrapper: {
    justifyContent: 'flex-start', // Align items to the left side
  },
  imageContainer: {
    margin: 5,
  },
  image: {
    flex: 1,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'white',
  },
});

export default LibraryScreen;
