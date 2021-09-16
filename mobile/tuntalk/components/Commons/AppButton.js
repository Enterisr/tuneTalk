import React from 'react';
import {StyleSheet, Pressable, useColorScheme, Text} from 'react-native';
import colors from '../../colors';
function AppButton({children, onPress, customStyle, textStyle}) {
  return (
    <Pressable
      android_ripple={{color: colors.text}}
      style={[styles.AppButton, customStyle]}
      onPress={onPress}>
      <Text style={[styles.textStyle, textStyle]}>{children}</Text>
    </Pressable>
  );
}
export default AppButton;
const styles = StyleSheet.create({
  AppButton: {
    backgroundColor: colors.variant,
    height: 50,
    width: 200,
    borderRadius: 4,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  textStyle: {
    fontSize: 22,
    letterSpacing: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    fontFamily: 'TitilliumWeb-Regular',
    color: colors.text,
  },
});
