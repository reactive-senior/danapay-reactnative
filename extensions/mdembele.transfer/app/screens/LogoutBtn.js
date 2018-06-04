import React, {
  Component
} from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { connect }        from 'react-redux';
import { navigateTo }     from '@shoutem/core/navigation';
import { ext }            from '../const';


export class LogoutBtn extends Component {
  
  componentDidMount() {
    const { updateConnectionStatus } = this.props;
    updateConnectionStatus(false);
    navigateTo('Walkthrough')
  }

  render() {
    return (
      <View />
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
)(LogoutBtn)

