import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import Store from './src/Redux/Store/store';
import {Provider} from 'react-redux';

import HomeScreen from './src/Screens/HomeScreen';

export default function App() {
  return (
    <Provider store={Store}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeScreen />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
