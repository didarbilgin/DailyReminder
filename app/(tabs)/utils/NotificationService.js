import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

// Bildirim Ayarları
export const configureNotifications = () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
};

// Anlık Bildirim
export const sendNotification = async (title, message) => {
    await Notifications.scheduleNotificationAsync({
        content: { title, body: message },
        trigger: null
    });
};

// Zamanlanmış Bildirim
export const scheduleNotification = async (title, message, date) => {
    await Notifications.scheduleNotificationAsync({
        content: { title, body: message },
        trigger: { date }
    });
};
export const scheduleLocationNotification = async (title, message, location) => {
    try {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Arka Plan Konum İzni Gerekli!', 'Lütfen ayarlardan izin verin.');
            return;
        }

        await Location.startLocationUpdatesAsync('background-location-task', {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 50,
            deferredUpdatesInterval: 60000,
            deferredUpdatesDistance: 100,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: "Konum Takibi Aktif",
                notificationBody: message,
            },
        });

        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: message
            },
            trigger: null
        });
    } catch (error) {
        console.error('Konum bazlı bildirim ayarlama hatası:', error);
    }
};

//  **Lokasyon Arka Plan Görevi**
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Location Task Error:', error);
        return;
    }
    const { locations } = data;
    const location = locations[0];
    console.log('Background Location:', location);

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Konum Tabanlı Hatırlatma',
            body: 'Belirlenen konuma ulaşıldı!',
        },
        trigger: null
    });
});