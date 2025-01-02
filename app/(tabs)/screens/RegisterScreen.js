import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { storeData } from '../utils/storage'; // storage.js'den gerekli fonksiyonu import edin

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Kullanıcı bilgilerini kaydet
    await storeData(username, password);
    Alert.alert('Success', 'User registered successfully!');
    navigation.navigate('Login'); // Login sayfasına yönlendirme
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
      <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login here
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
