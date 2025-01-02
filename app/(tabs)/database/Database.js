import SQLite from 'react-native-sqlite-storage';

export const getDBConnection = async () => {
    try {
      const db = await SQLite.openDatabase({
        name: 'app.db',
        location: 'default',
      });
      console.log('Database connection established:', db);
      return db;
    } catch (error) {
      console.error('Failed to open database:', error);
      throw error;
    }
  };

export const createTable = async (db) => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `;
    await db.executeSql(query);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

export const insertUser = async (db, username, password) => {
  try {
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    await db.executeSql(query, [username, password]);
    console.log('User inserted successfully');
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
};

export const getUser = async (db, username, password) => {
  try {
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    const [results] = await db.executeSql(query, [username, password]);
    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
