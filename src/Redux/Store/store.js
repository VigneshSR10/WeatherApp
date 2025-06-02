import {configureStore} from '@reduxjs/toolkit';
import weatherReducer from '../weatherSlice';

const Store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});

export default Store;
