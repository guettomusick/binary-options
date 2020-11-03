import 'react-redux';

import { AppState } from '../shared/redux';

declare module 'react-redux' {
  interface DefaultRootState extends AppState { };
}