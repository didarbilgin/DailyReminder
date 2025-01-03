import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { storeData, getData } from '../utils/storage';
import * as Notifications from 'expo-notifications';
import * as Network from 'expo-network';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig.extra.API_KEY;

import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { configureNotifications, scheduleNotification, scheduleLocationNotification } from '../utils/NotificationService';
import { registerBackgroundTask } from '../utils/BackgroundTaskService';


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


export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [wifiConnected, setWifiConnected] = useState(false);

  const [editTask, setEditTask] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false); // Eklendi
  const [selectedLocation, setSelectedLocation] = useState(null); // Eklendi
  const [location, setLocation] = useState(null); // Eklendi

  const requestLocationPermissions = async () => {
    try {
        // Foreground izni
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            Alert.alert(
                'Konum İzni Gerekli!',
                'Bu uygulama konum tabanlı hatırlatmalar için izne ihtiyaç duyar.',
                [{ text: 'Tamam' }]
            );
            return false;
        }

        // Background izni
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            Alert.alert(
                'Arka Plan Konum İzni Gerekli!',
                'Lütfen arka plan konum iznini etkinleştirin.',
                [
                    {
                        text: 'İzin Ver',
                        onPress: async () => {
                            const { status } = await Location.requestBackgroundPermissionsAsync();
                            if (status !== 'granted') {
                                Alert.alert('İzin Reddedildi', 'Konum izni verilmedi.');
                                return false;
                            }
                        }
                    }
                ]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Konum izni hatası:', error);
        return false;
    }
};



  useEffect(() => {

    configureNotifications();
    registerBackgroundTask();

    const loadTasks = async () => {
      const savedTasks = await getData('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    loadTasks();

    checkWifiConnection();
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
    await storeData('tasks', JSON.stringify(updatedTasks));

    scheduleNotification(newTask.name, taskTime);
    Alert.alert('Success', 'Task added successfully!');
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Konum izni gerekli!');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  const saveTasks = async (updatedTasks) => {
    setTasks(updatedTasks);
    await storeData('tasks', JSON.stringify(updatedTasks));
  };
  const handleAddTask = async () => {
    try {
        const hasPermission = await requestLocationPermissions();  // Doğrudan izin iste
        if (!hasPermission) {
            return;
        }

        if (!taskName.trim()) {
            Alert.alert('Uyarı', 'Görev adı boş olamaz.');
            return;
        }


  const scheduleNotification = async (taskName, taskTime) => {
    const currentTime = new Date().getTime();
    const selectedTime = taskTime.getTime();
    const delayInSeconds = Math.floor((selectedTime - currentTime) / 1000);

    if (delayInSeconds > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder!',
          body: `Reminder: Your task "${taskName}" is coming up!`,
        },
        trigger: {
          seconds: delayInSeconds,
        },
      });
    } else {
      Alert.alert('Warning', "You can't schedule a task in the past!");
    }
  };

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await storeData('tasks', JSON.stringify(updatedTasks));

        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            time: taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completed: false,
            location: selectedLocation ? `${selectedLocation.latitude}, ${selectedLocation.longitude}` : null,
        };

        // Konum bazlı bildirim
        if (selectedLocation) {
            await scheduleLocationNotification(
                taskName,
                `Konum bazlı hatırlatma: ${taskName}`,
                selectedLocation
            );
        }

        // Zaman bazlı bildirim
        await scheduleNotification(
            taskName,
            `Zamanlanmış hatırlatma: ${taskName}`,
            taskTime
        );

        const updatedTasks = [...tasks, newTask];
        await saveTasks(updatedTasks);
        setTaskName('');
        setSelectedLocation(null);
        Alert.alert('Başarı!', 'Görev başarıyla eklendi.');
    } catch (error) {
        console.error("Görev ekleme hatası:", error);
        Alert.alert('Hata!', 'Görev eklenirken bir hata oluştu.');
    }
};

  const handleDeleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(updatedTasks);

    Alert.alert('Success', 'Task deleted successfully!');

  };

  const toggleCompletion = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );

    setTasks(updatedTasks);
    await storeData('tasks', JSON.stringify(updatedTasks));
  };

    await saveTasks(updatedTasks);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setUpdatedTitle(task.name);
    setIsModalVisible(true);
  };

  const handleUpdateTask = async () => {
    if (!updatedTitle.trim()) {
        Alert.alert('Uyarı', 'Görev başlığı boş olamaz!');
        return;
    }

    // Mevcut görevler arasında güncellenecek olanı bul ve değiştir
    const updatedTasks = tasks.map((task) =>
        task.id === editTask.id ? { ...task, name: updatedTitle } : task
    );

    await saveTasks(updatedTasks);
    setTasks(updatedTasks);  // Görevlerin güncellenmesi state'e de yansıtıldı
    setIsModalVisible(false);
    setEditTask(null);
    setUpdatedTitle('');
    Alert.alert('Başarı', 'Görev başarıyla güncellendi!');
};

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTaskTime(selectedTime);
    }
  };

  const handleSelectLocation = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
    Alert.alert('Konum Seçildi', `Enlem: ${event.nativeEvent.coordinate.latitude}, Boylam: ${event.nativeEvent.coordinate.longitude}`);
    setIsLocationModalVisible(false);
};


  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <View>
        <Text style={styles.taskName}>{item.name}</Text>
        <Text style={styles.taskTime}>Time: {item.time}</Text>

        {item.location && <Text style={styles.taskTime}>Location: {item.location}</Text>}
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

        <TouchableOpacity onPress={() => handleEditTask(item)} style={styles.iconButton}>
          <Icon name="pencil" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.iconButton}>
          <Icon name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTaskTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Reminder</Text>

      <Text style={styles.wifiStatus}>
        {wifiConnected ? '✅ WiFi Connected' : '❌ No WiFi Connection'}
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks available. Add a task!</Text>}
        style={styles.taskList}
      />
      
      {/* Task Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
      />


    <TouchableOpacity
    style={styles.locationButton}
    onPress={() => setIsLocationModalVisible(true)}
>
    <View style={styles.locationButtonContent}>
        <Icon name="map-marker" size={24} color="#fff" />
        <Text style={styles.locationButtonText}>
          {selectedLocation ? 'Konum Seçildi' : 'Konum Seç'}
        </Text>
    </View>
</TouchableOpacity>

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
        <Text style={styles.addButtonText}>Get AI Task Suggestion</Text>
      </TouchableOpacity>


      {/* Konum Seçim Haritası */}
      <Modal visible={isLocationModalVisible} animationType="slide">
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location?.latitude || 37.78825,
            longitude: location?.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleSelectLocation}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} />}
        </MapView>
        <Button title="Konum Seç ve Kapat" onPress={() => setIsLocationModalVisible(false)} />
      </Modal>

     {/* Düzenleme Modalı */}
     <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.input}
              value={updatedTitle}
              onChangeText={setUpdatedTitle}
              placeholder="Enter new task title"
            />
            <Button title="Update Task" onPress={handleUpdateTask} />
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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


});


});

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
  aiButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold',alignItems: 'center'},
});

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


