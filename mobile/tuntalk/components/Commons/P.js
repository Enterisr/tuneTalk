import React from 'react';
import {StyleSheet, Text, useColorScheme} from 'react-native';
import colors from '../../colors';
function P({children, customStyles}) {
  return <Text style={[styles.P, customStyles]}>{children}</Text>;
}
export default P;
const styles = StyleSheet.create({
  P: {
    color: colors.text,
    fontSize: 25,
    padding: 2,
    fontFamily: 'TitilliumWeb-Regular',
  },
});
