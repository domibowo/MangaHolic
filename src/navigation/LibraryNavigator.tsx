import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LibraryScreen from '../screens/Library';
import MangaDetailScreen from '../screens/MangaDetail';
import ReaderScreen from '../screens/Reader';
import type { LibraryStackParamList } from './types';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="MangaDetail" component={MangaDetailScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}
