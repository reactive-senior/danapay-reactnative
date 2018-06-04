import React, {
  Component
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';

import { Title, Tile, Subtitle, Caption, Row, Image, Divider, DropDownMenu, Button, Icon, Screen, TouchableOpacity} from '@shoutem/ui'
import { NavigationBar }  from '@shoutem/ui/navigation';
import { Heading }        from '@shoutem/ui/components/Text';
import { navigateTo }     from '@shoutem/core/navigation';
import { ext }            from '../const';

import Tabs                          from 'react-native-tabs';
import { TabNavigator }              from 'react-navigation';
import SwitchSelector                from 'react-native-switch-selector'
import SearchInput, { createFilter } from 'react-native-search-filter';
import ActionButton                  from 'react-native-action-button';
// import transactions                  from '../assets/transactions';
import { connect }                   from 'react-redux';
import firebase                      from 'firebase'
import axios                         from 'axios';
import requestManager                from '../utils/requestManager'
import upIcon                        from '../assets/up-arrow.png'

const KEYS_TO_FILTERS = ['date', 'user.name', 'user.phone'];

window.navigator.userAgent = 'ReactNative';
import io from 'socket.io-client/dist/socket.io';
const socket = io('#transfer', {
  transports: ['websocket'] // you need to explicitly tell it to use websockets
});
socket.connect();

export class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      page:'first',
      searchTerm: '',
      balance: 0
    };

    this.reloadTransactions = this.reloadTransactions.bind(this)
    socket.on('starting', () => 
      this.reloadTransactions());
    socket.on('error', () => 
      this.reloadTransactions());
    socket.on('founds-transfered', () => 
      this.reloadTransactions());
  }

  componentDidMount(){
    this.reloadTransactions();
  }

  reloadTransactions(){
    const { transaction } = this.props;
    requestManager.getUser(transaction.senderPhoneNum)
    .then((user) => {
      this.setState({
        balance : user.tokenBalance, 
        balanceEUR : user.tokenBalance, 
        balanceCFA : user.tokenBalance*656, 
        userId : user.gId, 
        userNum : user.phoneNum
      })

      if(this.state.userId !== undefined && this.state.userNum !== undefined)
      {
        requestManager.getUserSentTransactions(this.state.userId, this.state.userNum)
        .then((_transactions) => {
          // alert(_transactions)
          this.setState({
            sentTransactions : _transactions,
          })
        })
        .catch((err) => {
          alert("(0) Serveur indisponible. Veuillez vous reconnecter un peu plus tard "+err);
        })

        requestManager.getUserReceivedTransactions(this.state.userId, this.state.userNum)
        .then((_transactions) => {
          // alert(_transactions)
          this.setState({
            receivedTransactions : _transactions,
          })
        })
        .catch((err) => {
          alert("(2) Serveur indisponible. Veuillez vous reconnecter un peu plus tard "+err);
        })
      }
    })
    .catch((err) => {
      alert("(3) Serveur indisponible. Veuillez vous reconnecter un peu plus tard "+ err);
    })
  }

  

  renderNavigationBar() {
    return (
      <NavigationBar
        hasHistory = {false}
        title="danapay"
        renderLeftComponent = {() => (
          <Button styleName="clear" style={{paddingTop : 5}} onPress={() => 
            {
              // navigateTo('Home')
            }}>
            <Text></Text>
          </Button>
        )}
      />
    )
  }
  
  renderCurrencySwhitch() {
    const options = [
      { label: 'EUR', value: '0' },
      { label: 'CFA', value: '1' }
    ];
    return(
      <View style = {styles.switchContent}>
        <SwitchSelector 
          options={options} 
          initial={0} 
          onPress={
            value => {
              // alert(value)
              switch(value){
                case '0' :
                  this.setState({balance : this.state.balanceEUR})
                  break;
                case '1' : 
                  this.setState({balance : this.state.balanceCFA})
                  break;
              }
            }
          } 
          borderColor='#fff'
          buttonColor='#00a9ff'
          backgroundColor='#fff'
          />
      </View>  
    );
  }

  renderCustomerMenuButon(){
    const { navigateTo } = this.props;
    const { updateConnectionStatus } = this.props;
    return(
      <ActionButton buttonColor="#00c85a" onPress={() => this.setState({ visibleModal: 0 })}>
        <ActionButton.Item buttonColor='#00c85a' title="Transférer" onPress={() => 
              {
                navigateTo('ContactSearch')
              }
            }>
          <Icon style={styles.actionButtonIcon} name='users'/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#00c85a' title="Payer" onPress={() => console.log("notes tapped!")}>
          <Icon style={styles.actionButtonIcon} name='activity'/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#00c85a' title="Se déconnecter" onPress={() => 
              {
                firebase.auth().signOut().then(function() {
                  updateConnectionStatus(false);
                }).catch(function(error) {
                  Alert('Serveur indisponible')
                });
              }}>
          <Icon style={styles.actionButtonIcon} name='turn-off'/>
        </ActionButton.Item>
      </ActionButton>
    );
  }

  renderDistributionMenuButon(){
    const { navigateTo } = this.props;
    const { updateConnectionStatus } = this.props;
    return(
      <ActionButton buttonColor="#00c85a" onPress={() => this.setState({ visibleModal: 0 })}>
        <ActionButton.Item buttonColor='#00c85a' title="Retrait" onPress={() => 
              {
                navigateTo('customersTransations')
              }
            }>
          <Icon style={styles.actionButtonIcon} name='users'/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#00c85a' title="Se déconnecter" onPress={() => 
              {
                firebase.auth().signOut().then(function() {
                  updateConnectionStatus(false);
                }).catch(function(error) {
                  Alert('Serveur indisponible')
                });
              }}>
          <Icon style={styles.actionButtonIcon} name='turn-off'/>
        </ActionButton.Item>
      </ActionButton>
    );
  }

  renderBalance(){
    return (
      <View styleName="vertical space-between">
        <TouchableOpacity styleName="stretch" style={{}}>
          <Image
            styleName="large"
            source={require('../assets/background.jpg')}
            style={{height:200}}
          >
            <Tile styleName='clear' style={{marginTop : -20}} >
              <Subtitle styleName="sm-gutter-bottom">Solde actuel</Subtitle>
              <Text styleName="sm-gutter-bottom" style={{fontSize:40, color:'white'}}>{this.state.balance}</Text>              
              {this.renderCurrencySwhitch()}
            </Tile>
          </Image>
        </TouchableOpacity>
      </View>
    );
  }

  renderTransactions()
  {
    if(this.state.page == "first")
      if(this.state.sentTransactions == undefined || this.state.sentTransactions.length == 0)
      return (
        <View style={{flex:1,backgroundColor:'white', padding : 20, alignItems : 'center'}}>
          <View style={{flex:1,backgroundColor:'white', height:10}}/>          
          <Text>Vous n'avez effectué aucun transfert</Text>
        </View>
      )
    else return (
        <ScrollView >
          {this.state.sentTransactions.map(_transaction => {
            return (
              <TouchableOpacity onPress={() => this.setState({ visibleModal: 1 })} key={_transaction._id} >
                <Divider styleName="line center" style = {{width : 300}}/>
                <View style={styles.transaction}>
                  <View style={{width:50, alignItems : 'center', justifyContent: 'center',}}>
                    <Image
                      styleName="small-avatar"
                      source={upIcon}
                      style={{width:30, height:30}}
                    />
                  </View>
                  <View style={{width:300}}>
                    <Row style={{paddingBottom: 0}}>
                      <Caption style={{color:'#c6c6c6'}}>{_transaction.date}</Caption>
                    </Row>
                    <Row style={{paddingTop: 0, paddingBottom: 0}}>
                      <Subtitle>{_transaction.recipientTag}</Subtitle>
                      <Subtitle style={{textAlign:'right'}}>{_transaction.amountEUR}</Subtitle>
                    </Row>
                    <Row style={{paddingTop: 0}}>
                      <Caption style={{color:'#c6c6c6'}}>{_transaction.recipientNum}</Caption>
                      <Caption style={{textAlign:'right', color:'#00c85a'}}>{_transaction.status}</Caption>
                    </Row>
                    
                  </View>
                </View>
                <Divider styleName="line center" style = {{width : 300}}/>
              </TouchableOpacity>)
          })}
          <View style={{flex:1,backgroundColor:'white', height:100}}></View>
        </ScrollView>
      )
    else if(this.state.page == "second")
      if(this.state.receivedTransactions == undefined || this.state.receivedTransactions.length == 0)
        return (
          <View style={{flex:1,backgroundColor:'white', padding : 20, alignItems : 'center'}}>
            <View style={{flex:1,backgroundColor:'white', height:10}}/>          
            <Text>Vous n'avez encore reçu aucun fond</Text>
          </View>
        )
      else return (
        <ScrollView>
          {this.state.receivedTransactions.map(_transaction => {
                return (
                  <TouchableOpacity onPress={() => this.setState({ visibleModal: 1 })} key={_transaction._id} >
                    <Divider styleName="line center" style = {{width : 300}}/>
                    <View style={styles.transaction}>
                      <View style={{width:50, alignItems : 'center', justifyContent: 'center',}}>
                        <Image
                          styleName="small-avatar"
                          source={upIcon}
                          style={{width:30, height:30}}
                        />
                      </View>
                      <View style={{width:300}}>
                        <Row style={{paddingBottom: 0}}>
                          <Caption style={{color:'#c6c6c6'}}>{_transaction.date}</Caption>
                        </Row>
                        <Row style={{paddingTop: 0, paddingBottom: 0}}>
                          <Subtitle>{_transaction.senderTag}</Subtitle>
                          <Subtitle style={{textAlign:'right'}}>{_transaction.amountEUR}</Subtitle>
                        </Row>
                        <Row style={{paddingTop: 0}}>
                          <Caption style={{color:'#c6c6c6'}}>{_transaction.senderNum}</Caption>
                          <Caption style={{textAlign:'right', color:'#00c85a'}}>{_transaction.status}</Caption>
                        </Row>
                      </View>
                    </View>
                    <Divider styleName="line center" style = {{width : 300}}/>
                  </TouchableOpacity>)
              })}
        </ScrollView>
      )
  }
  renderTabBar() {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        {this.renderTransactions()}
        <View style={{flex:1,backgroundColor:'white', height:150}}/>
        <Tabs selected={this.state.page} style={{backgroundColor:'white'}}
              selectedStyle={{color:'#00a9ff'}} onSelect={el=>this.setState({page:el.props.name})}>
            <Text name="first" selectedIconStyle={{borderTopWidth:2,borderTopColor:'#00a9ff'}}>Fonds envoyés</Text>
            <Text name="second" selectedIconStyle={{borderTopWidth:2,borderTopColor:'#00a9ff'}}>Fonds reçus</Text>
        </Tabs>
      </View>
    );
  }

  render() {
    const { transaction } = this.props;
    // if(transaction.senderType == "customer")
    //   return (
    //     <Screen>
    //       {this.renderNavigationBar()}
    //       {this.renderBalance()}
    //       {this.renderTabBar()}
    //       {this.renderCustomerMenuButon()}
    //     </Screen>
    //   );
    // else if(transaction.senderType == "sub-distributor")
    //   return (
    //     <Screen>
    //       {this.renderNavigationBar()}
    //       {this.renderBalance()}
    //       {this.renderTabBar()}
    //       {this.renderDistributionMenuButon()}
    //     </Screen>
    //   );
    return (
      <Screen>
        {this.renderNavigationBar()}
        {this.renderBalance()}
        {this.renderTabBar()}
        {this.renderCustomerMenuButon()}
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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  transaction: {
    flex : 1,
    flexDirection : 'row',
    padding : 1,
    margin : 1,
    backgroundColor : 'white', 
  },
  switchContent: {
    padding: 1,
    margin : 1,
    width : 200,
    borderRadius: 20,
    backgroundColor : 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    transaction : state[ext()].transaction,
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
)(Home)
