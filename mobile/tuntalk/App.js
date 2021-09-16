/**

 * @format
 * @flow strict-local
 */
import colors from './colors';
import Color from 'color';
import React from 'react';
import {StyleSheet, useColorScheme, View} from 'react-native';
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
    flex: 1,
    alignItems: 'center',
    backgroundColor: Color(colors.bg).darken(0.3).hex(),
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
