import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) {
        console.log("Error occurred in background task:", error);
        return;
    }
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Reminder",
            body: "It's time for your task!",
        },
        trigger: null,
    });
});

export const registerBackgroundTask = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    if (!isRegistered) {
        await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    }
};