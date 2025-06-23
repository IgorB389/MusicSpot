import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

// Funkcja do zarządzania motywem
export default function ThemeSettings() {
    const [isDarkMode, setIsDarkMode] = useState(false); // Stan motywu

    const toggleTheme = () => {
        setIsDarkMode(prevState => !prevState);
    };

    const themeStyles = isDarkMode ? styles.darkMode : styles.lightMode; // Dynamiczne style

    return (
        <View style={[styles.container, themeStyles]}>
            <Text style={styles.title}>Ustawienia Motywu</Text>
            <View style={styles.switchContainer}>
                <Text style={styles.label}>{isDarkMode ? 'Ciemny motyw' : 'Jasny motyw'}</Text>
                <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    label: {
        marginRight: 10,
        fontSize: 16,
    },
    lightMode: {
        backgroundColor: '#fff',
    },
    darkMode: {
        backgroundColor: '#333',
    },
});
