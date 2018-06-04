import React from 'react';

import {
  WebView,
  InteractionManager,
  StyleSheet
} from 'react-native';

import { 
  View, 
  Screen, 
  Image, 
  Tile, 
  Title, 
  Subtitle, 
  Text, 
  Caption,
  Heading, 
  Divider, 
  TouchableOpacity, 
  Button, 
  Row, 
  Icon, 
  ListView
} from '@shoutem/ui';

import {
  PulseIndicator,
} from 'react-native-indicators';

import { NavigationBar }  from '@shoutem/ui/navigation';
import Modal              from 'react-native-modal';
import { navigateTo }     from '@shoutem/core/navigation';
import { connect }        from 'react-redux';
import { ext }            from '../const';

import {resolveFlag}      from '../assets/flags.js'
import Home               from './Home'
import { resetStore }     from '../actions';
import connector          from '../assets/connector'
import axios              from 'axios';
import firebase           from 'firebase';

window.navigator.userAgent = 'ReactNative';
import io from 'socket.io-client/dist/socket.io';
const socket = io('#payment', {
  transports: ['websocket'] // you need to explicitly tell it to use websockets
});
socket.connect();

export class Confirmation extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      isAnimationFinished: false,
      paymentInProgress: false,
      transactionId: 0,
    };
    this.onTransactionResultReceived = this.onTransactionResultReceived.bind(this)
    socket.on('transaction', (response) => 
      this.onTransactionResultReceived(response));
  }

  onTransactionResultReceived(response){
    if(this.state.paymentInProgress)
    {
      if(response.transactionId == this.state.transactionId)
      {
        switch (response.status) {
          case 'OK' : 
            this.transferFunds();
            break;
          case 'KO' : 
            //Show modal 
            break;
        } 
      }
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ isAnimationFinished: true });
    }); 
  }

  componentDidUpdate()
  {
    if(this.state.paymentInProgress)
    {
      setTimeout(() => {
        //If no transaction result received since 20 sec 
        this.setState({paymentInProgress : false});
      }, 30000);
    }
  }

  renderNavigationBar() {
    const { navigateTo } = this.props;
    if(this.state.paymentInProgress)
      return (
        <NavigationBar
          hasHistory
          renderLeftComponent = {() => (
            <Button styleName="clear" style={{paddingTop : 5}} onPress={() => {}}>
              <Text></Text>
            </Button>
          )}
          renderRightComponent = {() => (
            <Button styleName="clear" style={{paddingTop : 5}} onPress={() => {}}>
              <Text></Text>
            </Button>
          )}
          title="PAIEMENT PAR CARTE"
        />
      )
    else
      return (
        <NavigationBar
          hasHistory
          renderRightComponent = {() => (
            <Button styleName="clear" style={{paddingTop : 5}} onPress={() => 
              {
                navigateTo('Home')
              }}>
              <Text>Annuler</Text>
            </Button>
          )}
          title="CONFIRMATION"
        />
      )
  }

  renderDetails() {
    const { transaction } = this.props;
    // if(this.state.paymentInProgress)
    //   return (
        <View style={{
          flex : 1,
          padding: 10,
          margin : 10,
          borderRadius: 5,
          backgroundColor : '#00a9ff',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
    //       <Text style={{color:'#fff'}}>
    //         Transfert en cours, veuillez patienter
    //       </Text>
    //       {/* <PulseIndicator color='#fff' /> */}
    //     </View>
    //   )
    // else
      return (
        <View styleName="vertical space-between" style={this.confirmationStyle()}>
          <TouchableOpacity styleName="stretch" style={{}}>
            <Image
              styleName="large"
              source={require('../assets/background.jpg')}
            >
              <Tile styleName='clear' style={{marginTop : -25}} >
                <Image
                  styleName="medium-avatar"
                  source={require('../assets/peoples/man1.png')}    
                  style = {{width: 100, height: 100}}      
                />
                <Subtitle styleName="sm-gutter-bottom">Bénéficiaire</Subtitle>
                <Title styleName="sm-gutter-bottom">{transaction.firstName} {transaction.name}</Title>
                <Text styleName="sm-gutter-bottom">{transaction.phoneNum}</Text>
              </Tile>
            </Image>
          </TouchableOpacity>
          {this.renderAmounts()}
          {this.renderFees()}
            
          <View style={{margin : 10, marginTop : 5}}>
            <Button style={{backgroundColor : '#00c85a'}} onPress={() => {
                var transactionId = (Math.random()*1000000).toFixed(0).toString();
                this.webview.injectJavaScript("load('test@gmail.com', "+transactionId+")")
                this.setState({paymentInProgress: true, transactionId : transactionId })
              }}>
              <Text style={{color : '#fff'}}>ENVOYER</Text>
            </Button>
          </View>
        </View>
      );
  }

  transferFunds(){
    const { transaction, navigateTo, resetStore } = this.props;
    const { transactionId } = this.state;
      firebase.auth().currentUser.getIdToken(true)
      .then(function(tokenId) {
        // alert('Transfer funds')
        axios.post('#transfer/api/TransferFounds', 
        {
          // TokenId : tokenId,
          TokenId : transactionId,
          senderId : transaction.senderGId,
          senderNum : transaction.senderPhoneNum,
          senderTag : transaction.senderName+" "+transaction.senderFirstName,
          recipientId : transaction.gId,
          recipientNum : transaction.phoneNum,
          recipientTag : transaction.name+" "+transaction.firstName,
          amountEur : transaction.sentAmount
        })
        .then(function (response) {
          switch(response.data) {
            case "Transaction has been succefully taken account" : 
              resetStore();
              navigateTo('Home');
              break;
            default : 
              alert("Serveur indisponible. Veuillez essayer dans quelques instant :"+response.data);
          }
        })
        .catch(function (error) {
          alert("Serveur indisponible. Veuillez essayer dans quelques instants")
        });
      })
      .catch(function(error) {
        //Important : traiter cette erreur de sorte que le back-office puisse --> rollback ?
        console.log(error)
      });
      
    
  }

  renderAmounts() {
    return (
      <View style={{margin: 10, marginTop : -45, borderRadius : 10, backgroundColor : 'white'}}>
        {this.renderSentAmount()}
        {this.renderReceivedAmount()}
      </View>
    );
  }

  renderSentAmount() {
    const { transaction } = this.props;
    return (
        <Row>
          <Image
              styleName="rounded-corners"
              style = {{width: 20, height: 20,borderRadius : 10}}
              source={resolveFlag(transaction.senderCountry)}
            />
          <View styleName="horizontal space-between">
            <View styleName="vertical stretch space-between">
              <Subtitle>{transaction.senderCountry}</Subtitle>
              <Caption>Montant à envoyer</Caption>
            </View>
            <Subtitle>{transaction.sentAmount}</Subtitle>
          </View>
          <Divider styleName="line" />
        </Row>
    );
  }

  renderReceivedAmount() {
    const { transaction } = this.props;
    return (
        <Row>
          <Image
              styleName="rounded-corners"
              style = {{width: 20, height: 20,borderRadius : 10}}
              source={resolveFlag(transaction.country)}
            />
          <View styleName="horizontal space-between">
            <View styleName="vertical stretch space-between">
              <Subtitle>{transaction.Country}</Subtitle>
              <Caption>Montant reçu</Caption>
            </View>
            <Subtitle>{transaction.receivedAmount}</Subtitle>
          </View>
          <Divider styleName="line" />
        </Row>
    );
  }

  renderFees() {
    
    const {transaction} = this.props;
    return (
      <View style={{margin: 10, marginTop : 5, borderRadius : 0, backgroundColor : 'white'}}>
      <Row>
        <View styleName="horizontal space-between">
          <View styleName="vertical stretch space-between">
            <Caption>Frais payés par vous</Caption>
            <Heading>Total à payer</Heading>
          </View>
          <View styleName="vertical stretch space-between" style={{alignItems:'flex-end'}}>
            <Caption>{transaction.fees}</Caption>
            <Heading>{transaction.totalToPay}</Heading>
          </View>
        </View>
      </Row>
    </View>
    );
  }

  _renderModalContent = () => (
    <View styleName="flexible">
      {this.renderWebView()}
    </View>
  );

  renderWebView() {
    
    if (this.state.isAnimationFinished) {
      return (
        <WebView
          source={require('../assets/testpayment.html')}
          ref={ref => (this.webview = ref)}
          scalesPageToFit
        />
      );
    }
    return (<View />);
  }

  renderBrowser() {
    return (
      <View styleName="flexible" style={this.paymentModalStyle()}>
        {/* <Modal
          // isVisible={this.state.visibleModal === 6}
          isVisible={true}
          onBackdropPress={() => this.setState({ paymentInProgress: false })}
        >
          {this._renderModalContent()}
        </Modal> */}
        {this._renderModalContent()}
      </View>
    );
  }

  paymentModalStyle() {
    
    if(!this.state.paymentInProgress)
      return {
        display: 'none',
      }
    else  
      return {}
  }

  confirmationStyle() {
    if(this.state.paymentInProgress)
    return {
      display: 'none',
    }
  else  
    return {}
  }

  render() {
    return (
      <Screen>
        {this.renderNavigationBar()}
        {this.renderDetails()}
        {this.renderBrowser()}
      </Screen>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    transaction : state[ext()].transaction,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetStore : () => {
      dispatch({
        type : 'RESET_STORE',
      })
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

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
  loadMessageContent: {
    padding: 10,
    margin : 10,
    borderRadius: 5,
    backgroundColor : '#00a9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default connect(
      mapStateToProps,
      mapDispatchToProps
    )(Confirmation)

