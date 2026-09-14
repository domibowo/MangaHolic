import { getFocusedRouteNameFromRoute, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Compass, Search, BookMarked } from 'lucide-react-native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BrowseNavigator from './BrowseNavigator';
import SearchNavigator from './SearchNavigator';
import LibraryNavigator from './LibraryNavigator';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Tinggi konten tab bar (icon + label), belum termasuk inset bawah —
// nilai dari DESIGN.md `components.tab-bar.height`.
const TAB_BAR_CONTENT_HEIGHT = 80;

function BrowseTabIcon({ color, size }: { color: string; size: number }) {
  return <Compass color={color} size={size} />;
}

function SearchTabIcon({ color, size }: { color: string; size: number }) {
  return <Search color={color} size={size} />;
}

function LibraryTabIcon({ color, size }: { color: string; size: number }) {
  return <BookMarked color={color} size={size} />;
}

export default function RootNavigator() {
  const insets = useSafeAreaInsets();

  // MangaDetail & Reader full-screen — tab bar disembunyikan saat di situ
  // (lihat DESIGN.md § Navigasi). Height dihitung eksplisit
  // (content + inset bawah) — dibiarkan default, bottom-tabs v7 salah
  // menghitung tinggi di setup edge-to-edge Android RN 0.87 sehingga
  // icon ter-clip vertikal (cuma separuh bawah kelihatan).
  function getTabBarStyle(route: RouteProp<RootTabParamList, keyof RootTabParamList>) {
    const focusedRoute = getFocusedRouteNameFromRoute(route);
    const hiddenOn: string[] = ['MangaDetail', 'Reader'];
    return {
      display: focusedRoute && hiddenOn.includes(focusedRoute) ? ('none' as const) : ('flex' as const),
      backgroundColor: '#ffffff',
      borderTopColor: '#e4e0d9',
      height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
      paddingBottom: insets.bottom,
    };
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#211f1c',
          tabBarInactiveTintColor: '#b3aca0',
        }}>
        <Tab.Screen
          name="BrowseTab"
          component={BrowseNavigator}
          options={({ route }) => ({
            title: 'Browse',
            tabBarIcon: BrowseTabIcon,
            tabBarStyle: getTabBarStyle(route),
          })}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchNavigator}
          options={({ route }) => ({
            title: 'Search',
            tabBarIcon: SearchTabIcon,
            tabBarStyle: getTabBarStyle(route),
          })}
        />
        <Tab.Screen
          name="LibraryTab"
          component={LibraryNavigator}
          options={({ route }) => ({
            title: 'Library',
            tabBarIcon: LibraryTabIcon,
            tabBarStyle: getTabBarStyle(route),
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
