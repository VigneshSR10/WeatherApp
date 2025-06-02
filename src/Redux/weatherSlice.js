import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

const API_KEY = '3f3a6b92bce61cee9365bc8254db8efe';

export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async ({latitude, longitude}, {rejectWithValue}) => {
    const units = 'metric';

    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${API_KEY}`,
      );
      const currentData = await currentResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${API_KEY}`,
      );
      const forecastData = await forecastResponse.json();

      if (!currentResponse.ok || !forecastResponse.ok) {
        return rejectWithValue('Failed to fetch weather or forecast data');
      }

      return {
        current: currentData,
        forecast: forecastData,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch weather data');
    }
  },
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    current: null,
    forecast: null,
    status: 'idle',
    error: null,
    locationError: null,
    weatherError: null,
    weatherLoading: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchWeatherData.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.locationError = null;
        state.weatherLoading = true;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload.current;
        state.forecast = action.payload.forecast;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.locationError = 'Failed to get location';
        state.weatherError = 'Failed to fetch weather data';
        state.weatherLoading = false;
      });
  },
});

export default weatherSlice.reducer;
