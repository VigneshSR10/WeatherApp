import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Image,
} from 'react-native';
import GetLocation from 'react-native-get-location';
import {useDispatch, useSelector} from 'react-redux';
import {fetchWeatherData} from '../Redux/weatherSlice';
const HomeScreen = () => {
  const dispatch = useDispatch();
  const {current, forecast, status, locationError, error, weatherError} =
    useSelector(state => state.weather);
  const [refreshing, setRefreshing] = useState(false);

  const temperatureUnit = 'metric';
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      console.warn('No permission');
      return;
    }

    try {
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      })
        .then(location => {
          console.log(location);
          dispatch(
            fetchWeatherData({
              latitude: location.latitude,
              longitude: location.longitude,
            }),
          );
        })
        .catch(error => {
          const {code, message} = error;
          console.warn(code, message);
        });
    } catch (e) {
      console.error('Unexpected error getting location:', e);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const getWeatherCondition = (temp, unit) => {
    const thresholds =
      unit === 'metric' ? {cold: 15, hot: 25} : {cold: 59, hot: 77};

    if (temp <= thresholds.cold) return 'cold';
    if (temp >= thresholds.hot) return 'hot';
    return 'cool';
  };

  const getNewsFilterDescription = () => {
    if (!current) return '';

    const condition = getWeatherCondition(current.main.temp, temperatureUnit);

    switch (condition) {
      case 'cold':
        return 'Showing depressing news (cold weather)';
      case 'hot':
        return 'Showing fear-related news (hot weather)';
      case 'cool':
        return 'Showing positive news (cool weather)';
      default:
        return null;
    }
  };

  const formatTime = timestamp => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const tempSymbol = temperatureUnit === 'metric' ? '°C' : '°F';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Weather & News</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>Setting</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'loading' && !refreshing ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        ) : weatherError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load weather data</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : current ? (
          <View style={styles.weatherContainer}>
            {/* Weather Card */}
            <View style={styles.weatherCard}>
              <View style={styles.weatherMain}>
                <Text style={styles.temperature}>
                  {Math.round(current.main.temp)}
                  {tempSymbol}
                </Text>
                <View style={styles.weatherIconContainer}>
                  {current.weather && current.weather[0] && (
                    <>
                      <Image
                        style={styles.weatherIcon}
                        source={{
                          uri: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
                        }}
                      />
                      <Text style={styles.weatherDescription}>
                        {current.weather[0].description}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailLabel}>Feels Like</Text>
                  <Text style={styles.weatherDetailValue}>
                    {Math.round(current.main.feels_like)}
                    {tempSymbol}
                  </Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailLabel}>Humidity</Text>
                  <Text style={styles.weatherDetailValue}>
                    {current.main.humidity}%
                  </Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailLabel}>Wind</Text>
                  <Text style={styles.weatherDetailValue}>
                    {current.wind.speed}{' '}
                    {temperatureUnit === 'metric' ? 'm/s' : 'mph'}
                  </Text>
                </View>
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailLabel}>Pressure</Text>
                  <Text style={styles.weatherDetailValue}>
                    {current.main.pressure} hPa
                  </Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailLabel}>Visibility</Text>
                  <Text style={styles.weatherDetailValue}>
                    {current.visibility
                      ? (current.visibility / 1000).toFixed(1) + ' km'
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailLabel}>UV Index</Text>
                  <Text style={styles.weatherDetailValue}>N/A</Text>
                </View>
              </View>

              <Text style={styles.locationName}>
                {current.name}, {current.sys.country}
              </Text>
            </View>

            {/* Forecast Card */}
            {forecast && forecast.list && (
              <View style={styles.forecastCard}>
                <Text style={styles.forecastTitle}>5-Day Forecast</Text>

                {/* Hourly Forecast (Next 24 hours) */}
                <View style={styles.hourlyForecastContainer}>
                  <Text style={styles.sectionTitle}>Hourly Forecast</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyScrollView}>
                    {forecast.list.slice(0, 8).map((item, index) => (
                      <View key={index} style={styles.hourlyItem}>
                        <Text style={styles.hourlyTime}>
                          {formatTime(item.dt)}
                        </Text>
                        <Image
                          source={{
                            uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
                          }}
                          style={styles.hourlyIcon}
                        />
                        <Text style={styles.hourlyTemp}>
                          {Math.round(item.main.temp)}
                          {tempSymbol}
                        </Text>
                        <Text style={styles.hourlyDesc}>
                          {item.weather[0].main}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Daily Forecast */}
                <View style={styles.dailyForecastContainer}>
                  <Text style={styles.sectionTitle}>Daily Forecast</Text>
                  {forecast.list
                    .filter((item, index) => index % 8 === 0)
                    .slice(0, 5)
                    .map((item, index) => (
                      <View key={index} style={styles.dailyItem}>
                        <View style={styles.dailyLeft}>
                          <Text style={styles.dailyDate}>
                            {formatDate(item.dt)}
                          </Text>
                          <View style={styles.dailyWeatherInfo}>
                            <Image
                              source={{
                                uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
                              }}
                              style={styles.dailyIcon}
                            />
                            <Text style={styles.dailyDesc}>
                              {item.weather[0].description}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.dailyRight}>
                          <Text style={styles.dailyTemp}>
                            {Math.round(item.main.temp)}
                            {tempSymbol}
                          </Text>
                          <Text style={styles.dailyHumidity}>
                            {item.main.humidity}% humidity
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.newsContainer}>
          <View style={styles.newsHeader}>
            <Text style={styles.newsTitle}>News Headlines</Text>
            <Text style={styles.filterDescription}>
              {getNewsFilterDescription()}
            </Text>
          </View>

          <Text style={styles.noNewsText}>No news articles available</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollContent: {
    padding: 16,
  },
  weatherContainer: {
    marginBottom: 24,
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherIconContainer: {
    alignItems: 'center',
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  weatherDescription: {
    textTransform: 'capitalize',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  weatherDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  // Forecast Styles
  forecastCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  // Hourly Forecast
  hourlyForecastContainer: {
    marginBottom: 20,
  },
  hourlyScrollView: {
    flexDirection: 'row',
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 70,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  hourlyTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  hourlyIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  hourlyDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  // Daily Forecast
  dailyForecastContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dailyLeft: {
    flex: 1,
  },
  dailyDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  dailyWeatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  dailyDesc: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  dailyRight: {
    alignItems: 'flex-end',
  },
  dailyTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dailyHumidity: {
    fontSize: 12,
    color: '#666',
  },
  newsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsHeader: {
    marginBottom: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  filterDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loader: {
    marginVertical: 24,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noNewsText: {
    textAlign: 'center',
    color: '#666',
    padding: 24,
  },
});

export default HomeScreen;
