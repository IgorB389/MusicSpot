import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PlayerScreen from '../screens/PlayerScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import { Ionicons } from '@expo/vector-icons';
import BottomPlayer from '../components/BottomPlayer';
import { useAudio } from '../context/AudioProvider';
import { useNavigationState } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { currentTrack } = useAudio();
  const state = useNavigationState(state => state);
  
  // Sprawdź aktualny ekran
  const currentRoute = state?.routes[state.index];
  const currentScreenName = currentRoute?.name;
  
  // Pokaż BottomPlayer tylko gdy jest currentTrack i NIE jesteś na PlayerScreen
  const showBottomPlayer = currentTrack && currentScreenName !== 'Player';

  const TabBarButton = ({ children, onPress, style }) => (
    <TouchableOpacity onPress={onPress} style={[styles.tabBarButton, style]}>
      {children}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Search') iconName = 'search';
            else if (route.name === 'Library') iconName = 'library';
            else if (route.name === 'Player') iconName = 'musical-notes';
            else if (route.name === 'Album') iconName = 'albums';

            return <Ionicons name={iconName} size={28} color={color} />;
          },
          tabBarActiveTintColor: 'limegreen',
          tabBarInactiveTintColor: 'gray',
          tabBarLabel: '',
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
        })}
        tabBar={(props) => {
          // Filtruj tylko widoczne ekrany
          const visibleRoutes = props.state.routes.filter(route => 
            route.name !== 'AlbumDetail'
          );
          
          const modifiedProps = {
            ...props,
            state: {
              ...props.state,
              routes: visibleRoutes,
              index: Math.min(props.state.index, visibleRoutes.length - 1)
            }
          };
          
          return (
            <View style={styles.customTabBar}>
              {visibleRoutes.map((route, index) => {
                // Sprawdź czy aktualny ekran to AlbumDetail - jeśli tak, podświetl Album
                const currentRouteName = props.state.routes[props.state.index]?.name;
                const shouldHighlight = currentRouteName === route.name || 
                  (currentRouteName === 'AlbumDetail' && route.name === 'Album');
                const isFocused = shouldHighlight;
                
                const onPress = () => {
                  const event = props.navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    props.navigation.navigate(route.name);
                  }
                };

                let iconName;
                if (route.name === 'Home') iconName = 'home';
                else if (route.name === 'Search') iconName = 'search';
                else if (route.name === 'Library') iconName = 'library';
                else if (route.name === 'Player') iconName = 'musical-notes';
                else if (route.name === 'Album') iconName = 'albums';

                return (
                  <TabBarButton key={route.key} onPress={onPress}>
                    <Ionicons 
                      name={iconName} 
                      size={28} 
                      color={isFocused ? 'limegreen' : 'gray'} 
                    />
                  </TabBarButton>
                );
              })}
            </View>
          );
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
        />
        <Tab.Screen
          name="Player"
          component={PlayerScreen}
        />
        <Tab.Screen
          name="Album"
          component={AlbumDetailScreen}
        />
        <Tab.Screen
          name="AlbumDetail"
          component={AlbumDetailScreen}
          options={{ 
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' }
          }}
        />
      </Tab.Navigator>

      {showBottomPlayer && (
        <View style={styles.bottomPlayerContainer}>
          <BottomPlayer />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#000',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  tabBar: {
    height: 60,
    paddingHorizontal: 0,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  tabBarItem: {
    flex: 1,
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bottomPlayerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60,
    zIndex: 1000,
  },
});