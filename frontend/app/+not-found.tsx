import React from 'react';
import { Link, Stack } from 'expo-router';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function NotFoundScreen() {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [bounceAnim, fadeAnim, scaleAnim]);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Page Not Found',
          headerShown: false,
        }} 
      />
      
      <LinearGradient
        colors={[Colors.light.primary + '10', Colors.light.background]}
        style={styles.container}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: bounceAnim }
              ]
            }
          ]}
        >
          {/* 404 Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.numberContainer}>
              <Text style={styles.number}>4</Text>
              <View style={styles.zeroContainer}>
                <Ionicons 
                  name="search-outline" 
                  size={60} 
                  color={Colors.light.primary}
                />
              </View>
              <Text style={styles.number}>4</Text>
            </View>
          </View>

          {/* Error Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Oops! Page Not Found</Text>
            <Text style={styles.subtitle}>
              The page you're looking for seems to have wandered off. 
              Let's get you back on track!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons 
                  name="home-outline" 
                  size={20} 
                  color={Colors.light.background}
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>Go Home</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                // Go back if possible, otherwise go to home
                // This would need to be implemented with navigation
              }}
            >
              <Ionicons 
                name="arrow-back-outline" 
                size={20} 
                color={Colors.light.primary}
                style={styles.buttonIcon}
              />
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              If you believe this is an error, please contact support
            </Text>
          </View>
        </Animated.View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 120,
    fontWeight: '800',
    color: Colors.light.primary,
    textShadowColor: Colors.light.primary + '20',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  zeroContainer: {
    marginHorizontal: 10,
    padding: 20,
    borderRadius: 50,
    backgroundColor: Colors.light.primary + '10',
    borderWidth: 2,
    borderColor: Colors.light.primary + '20',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray500,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: Colors.light.gray400,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Decorative elements
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    left: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.secondary + '10',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.15,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.warning + '15',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.3,
    right: width * 0.1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.success + '20',
  },
});