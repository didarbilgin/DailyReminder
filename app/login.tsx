import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('User Info:', userInfo);

      // Giriş başarılıysa token kaydedin ve ana ekrana yönlendirin
      await AsyncStorage.setItem('userToken', 'dummyToken');
      router.push('/(tabs)'); // Sekmelere yönlendirme
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Google ile Giriş Yap" onPress={handleGoogleSignIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});