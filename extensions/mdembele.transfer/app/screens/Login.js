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

import { NavigationBar, Screen,  TouchableOpacity, Icon, Image, Tile, Overlay, Title, Subtitle, Heading, Button } from '@shoutem/ui'
import { navigateTo }     from '@shoutem/core/navigation';

import Home               from './Home'
import Tabs               from 'react-native-tabs';
import BusyIndicator      from 'react-native-busy-indicator';
import loaderHandler      from 'react-native-busy-indicator/LoaderHandler';

import firebase           from 'firebase';
import { connect }        from 'react-redux';
import { ext }            from '../const';
import axios              from 'axios';

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
     fname: '',
     lname: '',
     email: '',
     password: '',
     phoneNum: '',
     error: '',
     connected: false,
     page:'login',
   };
   this.onLoginPress= this.onLoginPress.bind(this);
   this.onRegisterPress= this.onRegisterPress.bind(this);
   this.createDanapayUser= this.createDanapayUser.bind(this);
  }

  renderNavigationBar() {
    // return (
    //   <NavigationBar
    //     title={this.state.page}
    //   />
    // )
    return null
  }

  getDanapayUser(gId)
  {
    // const { updateTransactionUser } = this.props;
    return new Promise ((resolve, reject) => {
      axios.get('#user/api/getUser?gId='+gId)
      .then(function (response) {
        
        if(response.data.userGettingMessage.endsWith('Unable to find user.'))
        { 
          reject("Utilisateur non inscrit chez Danapay")
        }
        else 
        {
          let user = response.data.user
          resolve(user)
        }
      })
      .catch(function (error) {
        reject("Serveur indisponible. Veuillez essayer dans quelques instants")
        console.log(error)
      });
    })
  }

  createDanapayUser(userId){
    const { updateRegistrationStatus } = this.props;
    
    return new Promise ((resolve, reject) => {
        axios.post('#user/api/createUser', 
        {
            gId:userId,
            type:"customer",
            fname:this.state.fname,
            lname:this.state.lname,
            phoneNum:this.state.phoneNum,
            country:"France",
            passCode:this.state.password	
        })
        .then(function (response) {
            if(response.data.userCreationETHMessage == "User successfully created on Ethereum."
                && response.data.userCreationDBMessage == "User successfully created in database.")
            {
                updateRegistrationStatus(true);
                resolve()
            }
            else 
            {
                reject("Serveur indisponible. Veuillez reessayer ultérieurement")
            }
        })
        .catch(function (error) {
            reject("Serveur indisponible. Veuillez reessayer ultérieurement :"+error)
        });
    });
  }

  onLoginPress() {
    const { email, password } = this.state;
    const { navigateTo } = this.props;
    const { updateTransactionSenderUser } = this.props;
    const { updateTransactionSenderLocation } = this.props;
    const { updateRegistrationStatus } = this.props;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userFirebase) => { 
            this.getDanapayUser(userFirebase.uid)
            .then((userDanapay) => {
                updateRegistrationStatus(true);
                // alert(userdp.phoneNum)
                updateTransactionSenderUser(userDanapay.gId, userDanapay.type, userDanapay.fname, userDanapay.lname, userDanapay.phoneNum);
                updateTransactionSenderLocation("France","Paris","../assets/flags/France.png", "EUR");
            })
            .catch((message)=> {
              alert(message);
            })

            
         })
        .catch((err) => {
          alert('Serveur indisponible. Veuillez reessayer ultérieurement'+err)
     });
  }

  onRegisterPress() {
    const { email, password } = this.state;
    const { updateTransactionSenderUser } = this.props;
    const { updateTransactionSenderLocation } = this.props;
    
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => { 
            // alert('user '+user.uid)
            this.createDanapayUser(user.uid)
                .then(()=> {
                    //Set user unique identifier for the payment
                    updateTransactionSenderUser(user.uid, "customer", this.state.fname, this.state.lname, this.state.phoneNum);
                    updateTransactionSenderLocation("France","Paris","../assets/flags/France.png", "EUR");
                    loaderHandler.showLoader("Connexion")
                })
                .catch((message)=> {
                    alert(message)
                    loaderHandler.hideLoader();
                })
        })
        .catch((err) => {
           alert("Serveur d'authentification indisponible :"+err) 
           loaderHandler.hideLoader();
        });
  }

  renderLoginForm(){
    if(this.state.page == "login")
    return (
        
        <View style={styles.loginContainer}>
            <Text style={styles.title}>Saisissez vos identifiants</Text>
            <TextInput
                style={{height: 40}}
                onChangeText={(email) => this.setState({email})}
                value={this.state.email}
                placeholder="Email"
            />
            <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 0}}
                secureTextEntry={true}
                onChangeText={(password) => this.setState({password})}
                value={this.state.password}
                placeholder="Mot de passe"
            />
            <TouchableOpacity onPress={this.onLoginPress}>
                <View style={styles.loginView}>
                    <Text style={styles.loginText}>LogIn</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
    else if (this.state.page == "signin")
    return (
        <View style={styles.loginContainer}>
            <Text style={styles.title}>Inscription</Text>
            <TextInput
                style={{height: 40}}
                onChangeText={(fname) => this.setState({fname})}
                value={this.state.fname}
                placeholder="Nom"
            />
            <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 0}}
                onChangeText={(lname) => this.setState({lname})}
                value={this.state.lname}
                placeholder="Prénom"
            />
            <TextInput
                style={{height: 40}}
                onChangeText={(email) => this.setState({email})}
                value={this.state.email}
                placeholder="Email"
            />
            <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 0}}
                secureTextEntry={true}
                onChangeText={(password) => this.setState({password})}
                value={this.state.password}
                placeholder="Mot de passe"
            />
            <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 0}}
                keyboardType={'numeric'}
                onChangeText={(phoneNum) => this.setState({phoneNum})}
                value={this.state.phoneNum}
                placeholder="Numéro de téléphone"
            />
            <TouchableOpacity onPress={this.onRegisterPress}>
                <View style={styles.loginView}>
                    <Text style={styles.loginText}>Inscription</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
  }


  render() {
    return (
      <Screen style={{backgroundColor:'#fff'}}>
        {this.renderNavigationBar()}
        {this.renderLoginForm()}
        <Tabs selected={this.state.page} style={{backgroundColor:'white'}}
              selectedStyle={{color:'#00a9ff'}} onSelect={el=>this.setState({page:el.props.name})}>
            <Text name="login" selectedIconStyle={{borderTopWidth:2,borderTopColor:'#00a9ff'}}>Login</Text>
            <Text name="signin" selectedIconStyle={{borderTopWidth:2,borderTopColor:'#00a9ff'}}>Inscription</Text>
        </Tabs>
        <BusyIndicator />
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
  loginContainer : {
    backgroundColor:'#fff', 
    marginLeft: 20, 
    marginRight: 20
  },
  loginView: {
    margin: 20,
    height: 40,
    backgroundColor:'#00a9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#fff',
  },
  title: {
    alignSelf: 'center',
    marginTop: 40,
    margin: 40,
    fontSize: 15,
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
    updateRegistrationStatus : (_registered) => {
        dispatch({
          type : 'UPDATE_REGISTERED_STATUS',
          registered : _registered
        });
      },
    updateTransactionSenderUser : (_gId, _type, _firstName, _name, _phoneNum) => {
      dispatch({
        type : 'UPDATE_TRANSACTION_SENDER_USER',
        senderGId : _gId,
        senderType : _type,
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
