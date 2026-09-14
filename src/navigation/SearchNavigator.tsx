import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchScreen from '../screens/Search';
import MangaDetailScreen from '../screens/MangaDetail';
import ReaderScreen from '../screens/Reader';
import type { SearchStackParamList } from './types';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export default function SearchNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Search" component={SearchScreen} />
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
