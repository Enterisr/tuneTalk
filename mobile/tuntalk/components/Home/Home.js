import React from 'react';
import {Image, StyleSheet, View, Text} from 'react-native';
import Title from '../Commons/Title';
function Home(props) {
  return (
    <View style={styles.header}>
      <Image
        style={styles.logo}
        source={require('../../assets/images/ugly_logo.png')}
      />
      <Title>TuneTalk</Title>
    </View>
  );
}
export default Home;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    flexBasis: 50,
    backgroundColor: '#000',
  },
  logo: {
    flex: 0,
    marginHorizontal: 10,
    flexBasis: 50,
    height: 50,
  },
});
