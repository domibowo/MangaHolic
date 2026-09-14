import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BrowseScreen from '../screens/Browse';
import MangaDetailScreen from '../screens/MangaDetail';
import ReaderScreen from '../screens/Reader';
import type { BrowseStackParamList } from './types';

const Stack = createNativeStackNavigator<BrowseStackParamList>();

export default function BrowseNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Browse" component={BrowseScreen} />
      <Stack.Screen name="MangaDetail" component={MangaDetailScreen} />
      {/* gestureEnabled: false — swipe-back iOS berebutan dengan paging
          horizontal FlatList di Reader (swipe kanan malah keluar chapter).
          Tombol back manual di overlay Reader tetap jadi jalan keluar. */}
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
