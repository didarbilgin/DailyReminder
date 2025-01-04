# Welcome to DailyReminder 👋

DailyReminder is a mobile application built using React Native and Expo that allows users to create time and location-based task reminders. The project supports both iOS and Android platforms.

## Project Setup

Follow these steps to set up and run the project on your local machine.

 Ensure you have the following tools installed:  
	•	```Node.js: node -v```  
   •	```npm: npm -v```  
	•	```Expo CLI (if needed): npm install -g expo-cli```  

## Project Initialization

```npx create-expo-app DailyReminder```  
```cd DailyReminder```  
```npm install```  

## Start the Project

```npm start```  

This will open the Expo Developer Tools in your browser. You can test the app using:  
•	iOS Simulator  
 
•	Android Emulator  
 
•	Expo Go App on a physical device  

## iOS Setup (MacOS Only)

Ensure you have Xcode installed for running the iOS simulator.  

1.	Navigate to the ios folder:
   
```cd ios```  
```pod install```  
```cd ..```  

## Run the app on iOS Simulator:
```npx react-native run-ios```  

## Android Setup

Ensure you have Android Studio with an emulator configured.  
	
 1.	Start the project:   
 ```npx react-native start```  

 2.	Run the app on an Android emulator:  
  ``` npx react-native run-android ```  

## Development Tools and IDE Configuration

•	IDE: Visual Studio Code  
	
•	Project Structure:  

/DailyReminder  
├── /assets          # Images, icons, and other static files  
├── /components      # Reusable components  
├── /screens         # App screens and views  
├── /utils           # Utility functions and helpers  
├── App.js           # Main entry file  
├── package.json     # Project dependencies  
└── README.md        # Project documentation (this file)  

## Running the App on Physical Devices

You can test the app using the Expo Go app:  
	1.	Install Expo Go on your device from the App Store or Google Play.  
	2.	Run npm start and scan the QR code with Expo Go.  
