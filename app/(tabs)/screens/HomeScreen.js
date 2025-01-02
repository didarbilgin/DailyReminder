import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { storeData, getData } from '../utils/storage';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await getData('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    loadTasks();
  }, []);

  const saveTasks = async (updatedTasks) => {
    setTasks(updatedTasks);
    await storeData('tasks', JSON.stringify(updatedTasks));
  };

  const handleAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Warning', 'Task name cannot be empty!');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      time: taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
    setTaskName('');
    Alert.alert('Success', 'Task added successfully!');
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
    await saveTasks(updatedTasks);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setUpdatedTitle(task.name);
    setIsModalVisible(true);
  };

  const handleUpdateTask = async () => {
    if (!updatedTitle.trim()) {
      Alert.alert('Warning', 'Task title cannot be empty!');
      return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === editTask.id ? { ...task, name: updatedTitle } : task
    );
    await saveTasks(updatedTasks);
    setIsModalVisible(false);
    setEditTask(null);
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
        <TouchableOpacity onPress={() => handleEditTask(item)} style={styles.iconButton}>
          <Icon name="pencil" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.iconButton}>
          <Icon name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Reminder</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
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
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

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
  timeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  addButton: {
    height: 50,
    backgroundColor: '#00796b',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
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
});