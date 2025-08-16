import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { MaterialIcons } from '@expo/vector-icons';
import ApiService from '../services/apiService';

interface FaceRegistrationProps {
    onSuccess?: () => void;
}

const FaceRegistration = ({ onSuccess }: FaceRegistrationProps) => {
    const [name, setName] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraRef, setCameraRef] = useState<any>(null);
    const [permission, requestPermission] = useCameraPermissions();

    // Request camera permissions
    const requestCameraPermission = async () => {
        if (!permission) {
            const result = await requestPermission();
            return result.granted;
        }
        
        if (!permission.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permission Required', 'Camera access is needed to register faces.');
                return false;
            }
        }
        return true;
    };

    // Take photo with camera
    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;
        setShowCamera(true);
    };

    // Capture photo
    const capturePhoto = async () => {
        if (cameraRef) {
            try {
                const photo = await cameraRef.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                if (photo && photo.uri) {
                    setImageUri(photo.uri);
                }
                setShowCamera(false);
            } catch (error) {
                console.error('Error taking photo:', error);
                Alert.alert('Error', 'Failed to capture photo');
            }
        }
    };

    // Pick image from gallery
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Gallery access is needed to select images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Register face
    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        if (!imageUri) {
            Alert.alert('Error', 'Please select or capture an image');
            return;
        }

        setLoading(true);

        try {
            const result = await ApiService.registerFace(name.trim(), imageUri);

            Alert.alert(
                'Success!',
                result.message || `Face registered successfully for ${name}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setName('');
                            setImageUri(null);
                            onSuccess?.();
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert('Error', error.message || 'Failed to register face');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register New Face</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter person's name"
                    editable={!loading}
                />
            </View>

            {/* Image Selection */}
            <View style={styles.imageContainer}>
                <Text style={styles.label}>Photo</Text>

                {imageUri ? (
                    <View style={styles.selectedImageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setImageUri(null)}
                        >
                            <MaterialIcons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialIcons name="person" size={60} color="#ccc" />
                        <Text style={styles.placeholderText}>No image selected</Text>
                    </View>
                )}

                <View style={styles.imageButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.imageButton, styles.cameraButton]}
                        onPress={takePhoto}
                        disabled={loading}
                    >
                        <MaterialIcons name="camera-alt" size={24} color="#fff" />
                        <Text style={styles.imageButtonText}>Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.imageButton, styles.galleryButton]}
                        onPress={pickImage}
                        disabled={loading}
                    >
                        <MaterialIcons name="photo-library" size={24} color="#fff" />
                        <Text style={styles.imageButtonText}>Gallery</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <MaterialIcons name="person-add" size={24} color="#fff" />
                        <Text style={styles.registerButtonText}>Register Face</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Camera Modal */}
            <Modal
                visible={showCamera}
                animationType="slide"
                onRequestClose={() => setShowCamera(false)}
            >
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing="front"
                        ref={setCameraRef}
                    >
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowCamera(false)}
                            >
                                <MaterialIcons name="close" size={30} color="#fff" />
                            </TouchableOpacity>

                            <View style={styles.cameraControls}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={capturePhoto}
                                >
                                    <View style={styles.captureButtonInner} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    imageContainer: {
        marginBottom: 30,
    },
    selectedImageContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginBottom: 15,
    },
    selectedImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#4CAF50',
    },
    removeImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#ff4444',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 15,
    },
    placeholderText: {
        color: '#999',
        fontSize: 12,
        marginTop: 5,
    },
    imageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center',
    },
    cameraButton: {
        backgroundColor: '#2196F3',
    },
    galleryButton: {
        backgroundColor: '#FF9800',
    },
    imageButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
    },
    registerButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    registerButtonDisabled: {
        backgroundColor: '#ccc',
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
        padding: 10,
    },
    cameraControls: {
        alignItems: 'center',
        paddingBottom: 50,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: '#ddd',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2196F3',
    },
});

export default FaceRegistration;