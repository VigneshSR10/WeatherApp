// src/Redux/Store.js
import {configureStore} from '@reduxjs/toolkit';
import weatherReducer from '../weatherSlice'; // Make sure this path is correct

const Store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});

export default Store;
