import React, {
  Component
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  AsyncStorage
} from 'react-native';

import AppIntroSlider     from 'react-native-app-intro-slider';
import Icon               from 'react-native-vector-icons/Ionicons';
import { connect }        from 'react-redux';
import firebase           from 'firebase'
import Contacts           from 'react-native-contacts';

import { TouchableOpacity, Screen, Title} from '@shoutem/ui'
import { NavigationBar }  from '@shoutem/ui/navigation';
import { navigateTo }     from '@shoutem/core/navigation';

import { ext }            from '../const';
import Home               from './Home'
import Login              from './Login'

const firebaseConfig = {
  apiKey: "AIzaSyCr5uR1gAApN7pal6Pe7gOAPAAqL1adVM4",
  authDomain: "danapay-4d304.firebaseapp.com",
  databaseURL: "https://danapay-4d304.firebaseio.com",
  projectId: "danapay-4d304",
  storageBucket: "danapay-4d304.appspot.com",
  messagingSenderId: "378140996785"
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  image: {
    width: 320,
    height: 500,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const slides = [
  {
    key: 'somethun',
    image: require('../assets/walkthrough0.png'),    
    imageStyle: styles.image,
    backgroundColor: '#fff',
  },
  {
    key: 'somethun-dos',
    image: require('../assets/walkthrough1.png'),    
    imageStyle: styles.image,
    backgroundColor: '#fff',
  },
  {
    key: 'somethun1',
    image: require('../assets/walkthrough2.png'),    
    imageStyle: styles.image,
    backgroundColor: '#fff',
  },
  
];

export class Walkthrough extends Component {
  constructor(props) {
    super(props);
    this.state = {
     walkthroughEnded: false,
   };
  }
  
  componentWillMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  componentDidMount()
  {
    const { updateConnectionStatus } = this.props;
    const { registration } = this.props;
    
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      if(user) //connecté
      {
        
        setTimeout(() => {
          if(registration.registered == true)
          {
            // alert("User "+user);
            updateConnectionStatus(true);
          }
          else{
            alert('Serveur indisponible. Veuillez reessayer ultérieurement.')
          }
        }, 2000);
      }
      else //non connecté
      {
        updateConnectionStatus(false);
      }
    });
    // Pre-load phone contacts in the application
    this.preLoadContacts()
  }

  preLoadContacts(){
    Contacts.getAll( async (err, contacts) => {
      if(err === 'denied') 
        console.log('Unable to access contacts');
      else {
        var contactsStr = JSON.stringify(contacts);
        try{
          await AsyncStorage.setItem('@danapay:contacts', contactsStr); 
        } catch(error) {
          console.error("Unable to store contacts into AsyncStorage : "+error)
        }
      }
    })
  }

  componentWillUnmount()
  {
    this.authSubscription();
  }
  
  _renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="ios-arrow-round-forward"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: 'transparent' }}
        />
      </View>
    );
  }
  _renderDoneButton = () => {
    const { navigateTo } = this.props;
    return (
      <TouchableOpacity 
      onPress={() => {
        // navigateTo('Login')
        this.setState({walkthroughEnded : true});
        }
      }
      > 
        <View style={styles.buttonCircle}>
        <Icon
          name="ios-checkmark"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: 'transparent' }}
        />
      </View>
      </TouchableOpacity>
      
    );
  }
  _onDone = () => {
    //
  }

  renderWalkthrough() {
    return (
      <Screen>
        <NavigationBar
          styleName="no-border"
        />
        <AppIntroSlider
          slides={slides}
          activeDotColor='rgba(0, 184, 255, .9)'
          renderDoneButton={this._renderDoneButton}
          renderNextButton={this._renderNextButton}
          onDone={this._onDone}
        />
      </Screen>
    )
  }
  


  render() {
    const { connection } = this.props;
    if(connection.connected)
      return (
        <Home/>
      );
    else if (this.state.walkthroughEnded)
      return(
        <Login/>
      );
    else
      return (
        this.renderWalkthrough()
      );
  }
}

const mapStateToProps = (state) => {
  return {
    connection : state[ext()].connection,
    firebaseInitialized : state[ext()].initialized,
    registration : state[ext()].registration,
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
    firebaseInitializedStatus : (_initialized) => {
      dispatch({
        type : 'FIREBASE_INITIALIZED_STATUS',
        initialized : _initialized
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
)(Walkthrough)