import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faDirections, faPhotoVideo, faBolt } from '@fortawesome/free-solid-svg-icons';
import { Camera } from 'expo-camera';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const Stack = createStackNavigator();
const YOUR_SERVER_URL = 'https://jsonplaceholder.typicode.com/todos/1'

const MyStack = () => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen
          options={{headerShown: false}}
          name="Camera"
          component={CameraScreen}
        />
        <Stack.Screen name="Definition" component={Definition} />
      </Stack.Navigator>
    </NavigationContainer>
)

const Definition = ({ route, navigation }) => {

  const { uri } = route?.params;
  const blobToBase64 = blob => {
    const reader = new FileReader();
    reader.readAsDataURL(new File([blob], 'sending'));
    return new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  };

  const uploadImage = async () => {
      const formData = new FormData();
      const base64 = await blobToBase64(uri);
      formData.append('file', base64);
      await fetch(YOUR_SERVER_URL, {
        method: 'GET',
        body: formData,
        headers: {
          'content-type': 'multipart/form-data',
        },
      }).then(
        (json) => console.log('json', json)
      ).catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    uploadImage();
  }, [])

  return (
    <View flex={1}>
        {uri ? (
          <View>
            <Image source={{ uri }} style={{width:500,height:400}} />
            <Text style={{
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 'bold',
            }}>center</Text>
          </View>
        ) : (
          <Text>Something wrong</Text>
        )}
    </View>
  )
}
  
const CameraScreen = ({ navigation }) => {

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef();

  useEffect(() => {
    (async () => {
      const { status: cameraRollStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraRollStatus !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }

      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const flipCamera = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  }
  
  const onFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off 
        ? Camera.Constants.FlashMode.on
        :  Camera.Constants.FlashMode.off
    )
  }

  const takePicture = async () => {
    if (cameraRef) {
      const { uri } = await cameraRef?.current.takePictureAsync(); 
      const asset = await MediaLibrary.createAssetAsync(uri);
      navigation.navigate('Definition', {
        uri
      })
    }
  }

  const showGallery = async () => {
    let {uri} = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (uri) {
      navigation.navigate('Definition', {
        uri
      })
    }
  }

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
  <View style={styles.container}>
    <Camera style={styles.camera} type={type} ref={cameraRef}>
    <View style={{flex: 1, paddingTop: 20}}>
      <TouchableOpacity
        style={{
          alignItems: 'center', alignSelf:'center'

        }}>
        <FontAwesomeIcon icon={ faBolt } size={40} onPress={onFlash}/>
      </TouchableOpacity>
    </View>
    <View style={{flex:1, flexDirection:"row",justifyContent:"space-between",margin:20}}>    
      <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
          alignItems: 'center',
          backgroundColor: 'transparent',                  
        }}>
        <FontAwesomeIcon icon={ faDirections } size={40} onPress={flipCamera}/>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}>
        <FontAwesomeIcon icon={ faCamera } size={40} onPress={takePicture} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}>
        <FontAwesomeIcon icon={ faPhotoVideo } size={40} onPress={showGallery}/>
      </TouchableOpacity>
    </View>
    </Camera>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
});

export default MyStack;