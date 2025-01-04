import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Notifications from 'expo-notifications';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import axios from 'axios';

const API_KEY = Constants.expoConfig.extra.API_KEY;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const suggestTask = async () => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: 'text-davinci-003',
                prompt: "Günlük tekrar eden görevler öner: (Örnek: Su içmek, Egzersiz yapmak, Kitap okumak)",
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const suggestion = response.data.choices[0].text.trim();
        Alert.alert('AI Task Suggestion', suggestion);
    } catch (error) {
        console.error('Error fetching task suggestion:', error);
        Alert.alert('Error', 'Failed to fetch task suggestions.');
    }
};

const requestLocationPermissions = async () => {
    try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            Alert.alert('Konum izni gerekli!', 'Konum izni olmadan bu işlem yapılamaz.');
            return false;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            Alert.alert('Arka plan konum izni gerekli!', 'Lütfen arka plan iznini aktif edin.');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Konum izni hatası:', error);
        return false;
    }
};

export default function HomeScreen() {
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [taskTime, setTaskTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [wifiConnected, setWifiConnected] = useState(false);

    useEffect(() => {
        checkWifiConnection();
        requestLocationPermissions();
    }, []);

    const checkWifiConnection = async () => {
        try {
            const networkState = await Network.getNetworkStateAsync();
            setWifiConnected(networkState.isInternetReachable);
        } catch (error) {
            console.error('Error checking WiFi connection:', error);
        }
    };

    const addTask = async () => {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
            Alert.alert('Konum İzni Gerekli!', 'Görevi ekleyebilmek için konum izni verilmelidir.');
            return;
        }

        if (!taskName.trim()) {
            Alert.alert('Warning', 'Task name is required!');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            time: taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completed: false,
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setTaskName('');
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Task Reminder',
                body: `Don't forget your task: ${taskName}`,
            },
            trigger: { seconds: Math.floor((taskTime - new Date()) / 1000) },
        });

        Alert.alert('Success', 'Task added successfully!');
    };

    const deleteTask = async (id) => {
        const updatedTasks = tasks.filter((task) => task.id !== id);
        setTasks(updatedTasks);
        Alert.alert('Success', 'Task deleted successfully!');
    };

    const toggleCompletion = async (id) => {
        const updatedTasks = tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTaskTime(selectedTime);
        }
    };

    const renderTask = ({ item }) => (
        <View style={styles.taskContainer}>
            <View>
                <Text style={styles.taskName}>{item.name}</Text>
                <Text style={styles.taskTime}>Time: {item.time}</Text>
            </View>
            <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => toggleCompletion(item.id)} style={styles.iconButton}>
                    <Icon
                        name={item.completed ? 'check-circle' : 'circle-outline'}
                        size={24}
                        color={item.completed ? '#2ecc71' : '#3498db'}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
                    <Icon name="delete" size={24} color="#e74c3c" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Reminder</Text>
            <Text style={styles.wifiStatus}>
                {wifiConnected ? '✅ WiFi Connected' : '❌ No WiFi Connection'}
            </Text>

            <FlatList
                data={tasks}
                renderItem={renderTask}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No tasks available. Add a task!</Text>}
                style={styles.taskList}
            />

            <TextInput
                style={styles.input}
                placeholder="Task Name"
                value={taskName}
                onChangeText={setTaskName}
            />

            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.timeButtonText}>
                    Select Time: {taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </TouchableOpacity>

            {showTimePicker && (
                <DateTimePicker
                    value={taskTime}
                    mode="time"
                    display="default"
                    is24Hour={true}
                    onChange={onTimeChange}
                />
            )}

            <TouchableOpacity style={styles.addButton} onPress={addTask}>
                <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.aiButton} onPress={suggestTask}>
                <Text style={styles.aiButtonText}>Get AI Task Suggestion</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e0f7fa' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00796b', textAlign: 'center', marginBottom: 20 },
  taskList: { flex: 1, marginBottom: 20 },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  taskName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  taskTime: { fontSize: 14, color: '#00796b' },
  taskActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginHorizontal: 5 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
  wifiStatus: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  timeButton: {
    height: 50,
    backgroundColor: '#00796b',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  timeButton: {
    height: 50,
    backgroundColor: '#00796b',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  timeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  addButton: {
    height: 50,
    backgroundColor: '#00796b',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },

  aiButton : {
    height: 50,
    backgroundColor: '#00796b',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#00796b' },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  modalButton: {

    backgroundColor: '#00796b',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 10,
  },
  


    padding: 10,
    marginTop: 10,
  },
  modalButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  cancelText: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#00796b',
    marginBottom: 10,
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});

  
