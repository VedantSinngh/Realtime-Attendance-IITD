// frontend/components/GeoFenceAuth.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

// Target location (IIT Delhi example)
const TARGET_LOCATION = {
  latitude: 28.5450,
  longitude: 77.1926,
};
const RADIUS_METERS = 70;

// Function to request location permission
const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'App requires location access to verify login zone',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    return false;
  }
};

// Haversine formula to calculate distance in meters
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const GeoFenceAuth = () => {
  const [location, setLocation] = useState(null);

  const checkAndLogin = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location access is required.');
      return;
    }

    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });

        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          TARGET_LOCATION.latitude,
          TARGET_LOCATION.longitude,
        );

        if (distance <= RADIUS_METERS) {
          Alert.alert('✅ Access Granted', 'You are within the login zone.');
          // Call your face registration/login function here
        } else {
          Alert.alert(
            '❌ Access Denied',
            `You are ${Math.round(distance)}m away. Must be within ${RADIUS_METERS}m.`,
          );
        }
      },
      (error) => {
        Alert.alert('Location Error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geo-Fenced Login</Text>
      {location && (
        <Text>
          Your Location: {location.latitude.toFixed(5)},{' '}
          {location.longitude.toFixed(5)}
        </Text>
      )}
      <View style={{ marginTop: 20 }}>
        <Button title="Login / Register Face" onPress={checkAndLogin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
});

export default GeoFenceAuth;
