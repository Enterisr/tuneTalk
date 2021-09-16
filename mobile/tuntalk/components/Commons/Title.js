import React from 'react';
import {StyleSheet, Text, useColorScheme} from 'react-native';

function Title({children, customStyles}) {
  return <Text style={[styles.title, customStyles]}>{children}</Text>;
}
export default Title;
const styles = StyleSheet.create({
  title: {
    color: 'green',
    fontSize: 30,
    flex: 0,
    fontFamily: 'TitilliumWeb-Regular',
  },
});
