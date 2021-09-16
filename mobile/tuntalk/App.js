/**

 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, Text, useColorScheme, View} from 'react-native';
import Home from './components/Home/Home';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.appWrap}>
      <Home />
    </View>
  );
};

const styles = StyleSheet.create({
  appWrap: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
  },

  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
