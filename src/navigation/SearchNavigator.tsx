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
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}
