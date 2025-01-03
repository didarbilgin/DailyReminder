import * as Notifications from 'expo-notifications';

export const configureNotifications = () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
};

// Anlık bildirim gönderme
export const sendNotification = async (title, message) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body: message,
        },
        trigger: null, // Anlık bildirim
    });
};

// Zamanlanmış Bildirim
export const scheduleNotification = async (title, message, date) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body: message,
        },
        trigger: date,  // Belirtilen tarihte çalışır
    });
};