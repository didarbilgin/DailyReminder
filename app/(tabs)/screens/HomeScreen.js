import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { storeData, getData, removeData } from '../utils/storage'; // Storage işlevlerini import edin

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]); // Görev listesi
  const [taskInput, setTaskInput] = useState(''); // Yeni görev için input

  // AsyncStorage'den görevleri yükle
  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await getData('tasks'); // Görevler "tasks" anahtarında saklanır
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks)); // AsyncStorage'den JSON'u çöz
      }
    };
    loadTasks();
  }, []);

  // Görev ekleme
  const addTask = async () => {
    if (taskInput.trim() === '') {
      Alert.alert('Warning', 'Task cannot be empty!');
      return;
    }

    const newTask = { id: Date.now().toString(), name: taskInput };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setTaskInput(''); // Input'u temizle
    await storeData('tasks', JSON.stringify(updatedTasks)); // AsyncStorage'ye kaydet
    Alert.alert('Success', 'Task added successfully!');
  };

  // Görev silme
  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await storeData('tasks', JSON.stringify(updatedTasks)); // Güncellenmiş görevleri kaydet
    Alert.alert('Success', 'Task deleted successfully!');
  };

  // Görev listeleme
  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskText}>{item.name}</Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks available. Add a task!</Text>}
        style={styles.taskList}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter a task"
        value={taskInput}
        onChangeText={setTaskInput}
      />
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
  taskText: { fontSize: 16, color: '#333' },
  deleteText: { color: '#e74c3c', fontWeight: 'bold' },
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
  addButton: {
    height: 50,
    backgroundColor: '#00796b',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});