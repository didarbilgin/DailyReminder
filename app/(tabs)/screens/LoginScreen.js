import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { getData } from '../utils/storage'; // storage.js'den gerekli fonksiyonu import edin

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const storedPassword = await getData(username); // AsyncStorage'den şifreyi al
    if (storedPassword === password) {
      Alert.alert('Success', `Welcome, ${username}!`);
      navigation.navigate('Home'); // Ana sayfaya yönlendirme
    } else {
      Alert.alert('Error', 'Invalid username or password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        mode="outlined"
      />
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#e0f7fa' },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 20, color: '#00796b' },
  input: { marginBottom: 20 },
  button: { backgroundColor: '#00796b', marginBottom: 10 },
  linkText: { textAlign: 'center', color: '#00796b', marginTop: 10 },
});
