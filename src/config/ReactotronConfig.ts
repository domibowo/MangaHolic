import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

// Hanya aktif di development — reactotron-react-native & reactotron-redux
// ada di devDependencies, jangan diimpor dari kode yang jalan di build release.
const reactotron = Reactotron.configure({ name: 'Mangaholic' })
  .useReactNative({
    networking: {
      // RTK Query (fetchBaseQuery) pakai fetch/XHR di baliknya — otomatis
      // ke-log di sini tanpa perlu console.log manual di api layer.
      ignoreUrls: /symbolicate/,
    },
  })
  .use(reactotronRedux())
  .connect();

export default reactotron;
