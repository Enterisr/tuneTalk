import React, {useState} from 'react';
import {Image, StyleSheet, View, TextInput} from 'react-native';
import colors from '../../colors';
import AppButton from '../Commons/AppButton';
import Title from '../Commons/Title';
import P from '../Commons/P';
import Color from 'color';
function Home(props) {
  const [nickName, setNickname] = useState('');
  return (
    <View style={styles.homeWrap}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require('../../assets/images/ugly_logo.png')}
        />
        <Title>TuneTalk</Title>
      </View>
      <View>
        <P>Here goes your nickname:</P>
        <TextInput
          value={nickName}
          onChangeText={val => setNickname(val)}
          style={styles.nickNameInput}
        />
      </View>
      <AppButton
        customStyle={{
          marginBottom: '10%',
          height: 70,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          elevation: 6,
          width: 200,
        }}>
        Start Chatting
      </AppButton>
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

    backgroundColor: colors.bg,
  },
  nickNameInput: {
    backgroundColor: 'white',
    width: 300,
    fontSize: 20,
    marginTop: 5,
    borderRadius: 5,
  },
  homeWrap: {
    textAlign: 'center',
    alignItems: 'center',
    flex: 1,
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
  logo: {
    flex: 0,
    marginHorizontal: 10,
    flexBasis: 50,
    height: 50,
  },
});
