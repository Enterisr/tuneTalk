import React from 'react';
import {StyleSheet, Text, useColorScheme} from 'react-native';
import colors from '../../colors';
function Title({children, customStyles}) {
  return <Text style={[styles.title, customStyles]}>{children}</Text>;
}
export default Title;
const styles = StyleSheet.create({
  title: {
    color: colors.accent,
    fontSize: 30,
    flex: 0,
    fontFamily: 'TitilliumWeb-Regular',
  },
});
