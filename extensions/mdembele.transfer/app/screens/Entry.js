import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { navigateTo }     from '@shoutem/core/navigation';

import { connect }        from 'react-redux';
import { ext }            from '../const';
import Login from './Login'
import Home from './Home'

export class Entry extends Component {
  
  
  render() {
    const { connection } = this.props;
    if(!connection.connected)
      return (
        <View style={styles.container}>
          <Login/>
        </View>
      );
    else  
      return (
        <View style={styles.container}>
          <Home/>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});


const mapStateToProps = (state) => {
  return {
    connection : state[ext()].connection,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateConnectionStatus : (_connected) => {
      dispatch({
        type : 'UPDATE_CONNECTION_STATUS',
        connected : _connected
      });
    },
    navigateTo : (_screen) => {
      dispatch(
        navigateTo({
          screen: ext(_screen),
          props: { }
        })
      )
    }
  }
}

export default connect(
      mapStateToProps,
      mapDispatchToProps
    )(Entry)