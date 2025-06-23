import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const handleLogout = async (navigation) => {
    try {
        await AsyncStorage.removeItem('@user_data');
        Alert.alert('Wylogowano', 'Powrót do logowania');
        navigation.navigate('Login'); // Nawigacja z powrotem do Logowania
    } catch (error) {
        Alert.alert('Błąd', 'Nie udało się wylogować');
    }
};
