import React, {
  Component
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView, 
  Spinner,
  TextInput,
  ScreenButton, 
} from 'react-native';

import { Screen,  TouchableOpacity, Icon } from '@shoutem/ui'
import { navigateTo }     from '@shoutem/core/navigation';
import { NavigationBar }  from '@shoutem/ui';


import Home               from './Home'

import firebase           from 'firebase';
import firebaseui         from 'firebaseui';
import { connect }        from 'react-redux';
import { ext }            from '../const';

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
     email: 'test@test.com',
     password: 'mamama',
     error: '',
     connected: false,
   };
   this.onLoginPress= this.onLoginPress.bind(this);
  }

  renderNavigationBar() {
    return (
      <NavigationBar
        title="LOGIN"
      />
    )
  }

  onLoginPress() {
    this.setState({ error: '', loading: true });
    const { email, password } = this.state;
    const { navigateTo } = this.props;
    const { updateTransactionSenderUser } = this.props;
    const { updateTransactionSenderLocation } = this.props;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => { 
          updateTransactionSenderUser("Moussa", "DEMBELE", "0033651215693");
          updateTransactionSenderLocation("France","Paris","../assets/flags/France.png", "EUR");
         })
        .catch(() => {
          //Login was not successful, let's create a new account
          // firebase.auth().createUserWithEmailAndPassword(email, password)
          //     .then(() => { alert("Successfully Created new account") })
          //     .catch(() => {
          //        alert('Something wrong') 
          //     });
     });

     firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
      // Send token to your backend via HTTPS
      // ...
    }).catch(function(error) {
      // Handle error
    });
  }

  renderLoginForm(){
    
  }


  render() {
    return (
      <Screen>
        {this.renderNavigationBar()}
        <Text style={styles.title} >Login with Firebase </Text>
        <TextInput
          style={{height: 40}}
          onChangeText={(email) => this.setState({email})}
          value={this.state.email}
          placeholder="Enter your email"
        />
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          secureTextEntry={true}
          onChangeText={(password) => this.setState({password})}
          value={this.state.password}
          placeholder="Enter your password"
        />
        <TouchableOpacity onPress={this.onLoginPress}>
          <View style={styles.loginView}>
            <Text style={styles.loginText}>LogIn</Text>
          </View>
        </TouchableOpacity>
      </Screen>
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
  errorTextStyle: {
    color: '#E64A19',
    alignSelf: 'center',
    paddingTop: 10,
    paddingBottom: 10
  },
  loginView: {
    margin: 20,
    height: 40,
    backgroundColor:'#E64A19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#fff',
  },
  title: {
    alignSelf: 'center',
    margin: 40,
    fontSize: 20,
  }
});



const mapDispatchToProps = (dispatch) => {
  return {
    updateConnectionStatus : (_connected) => {
      dispatch({
        type : 'UPDATE_CONNECTION_STATUS',
        connected : _connected
      });
    },
    updateTransactionSenderUser : (_firstName, _name, _phoneNum) => {
      dispatch({
        type : 'UPDATE_TRANSACTION_SENDER_USER',
        senderFirstName : _firstName,
        senderName : _name,
        senderPhoneNum : _phoneNum
      });
    },
    updateTransactionSenderLocation : (_country, _city, _flag, _currency) => {
      dispatch({
        type : 'UPDATE_TRANSACTION_SENDER_LOCATION',
        senderCountry : _country,
        senderCity : _city,
        senderFlag : _flag,
        senderCurrency : _currency
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
  undefined,
  mapDispatchToProps
)(Login)
