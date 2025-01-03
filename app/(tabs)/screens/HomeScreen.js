import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { storeData, getData } from '../utils/storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await getData('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    loadTasks();
  }, []);

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
  };

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
        console.log(`Notification scheduled in ${delayInSeconds} seconds.`);
    } else {
        console.log("Selected time is in the past.");
        Alert.alert("Warning", "You can't schedule a task in the past!");
    }
};

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await storeData('tasks', JSON.stringify(updatedTasks));
    Alert.alert('Success', 'Task deleted successfully!');
  };

  const toggleCompletion = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await storeData('tasks', JSON.stringify(updatedTasks));
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

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTaskTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Reminder</Text>
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
  input: {
    height: 50,
    borderColor: '#00796b',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
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
});
