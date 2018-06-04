import React, {
  Component
} from 'react';

import {
  StyleSheet,
  View
} from 'react-native';

import { 
  Text, 
  Title, 
  Caption, 
  Subtitle, 
  Row, 
  Image, 
  DropDownMenu, 
  Button, 
  ListView, 
  Screen, 
  TextInput, 
  Divider} from '@shoutem/ui'

import SwitchSelector       from 'react-native-switch-selector'
import { Heading }          from '@shoutem/ui/components/Text';
import { NavigationBar }    from '@shoutem/ui/navigation';
import { navigateTo }       from '@shoutem/core/navigation';
import { connect }          from 'react-redux';
import { ext }              from '../const';
import { TouchableOpacity } from '@shoutem/ui/components/TouchableOpacity';
import { resolveFlag }      from '../assets/flags'

export class AmountSetting extends Component {
  constructor(props) {
    super(props);
    this.renderCountries = this.renderAmounts.bind(this);
    this.state = {
      areFeesSupported : true,
      sentAmount : 0,
      receivedAmount : 0,
      fees : 0,
      totalToPay : 0,
    };
  }

  renderNavigationBar() {
    return (
      <NavigationBar
        hasHistory
        renderRightComponent = {() => (
          <Button style={{paddingTop : 5}} onPress={() => 
            {
              navigateTo({
                screen: ext('Home'),
                props: { }
              })
            }}>
            <Text>Annuler</Text>
          </Button>
        )}
        title="MONTANT"
      />
    )
  }

  renderFeePayerSwhitch() {
    const options = [
      { label: 'Moi', value: true },
      { label: 'Mon bénéficiaire', value: false }
    ];
    return(
      <View style = {styles.switchContent}>
        <Subtitle styleName='md-gutter-bottom'>Qui supporte les frais ?</Subtitle>
        <SwitchSelector 
          options={options} 
          initial={0} 
          onPress={value => console.log("Call onPress with value: ", value)} 
          borderColor='#fff'
          buttonColor='#00c85a'
          backgroundColor='#f5f8fa'
          onPress={value => this.state.areFeesSupported = value}
          />
      </View>  
    );
  }

  resolveFees(amount){
    if(amount <= 500) {
      var fees = (amount*3/100).toFixed(2);
      this.setState({
        fees : fees,
        totalToPay : (parseInt(this.state.sentAmount, 10) + parseFloat(fees, 10)).toFixed(2)
      })
    }
    else {
      this.setState({
        fees : (amount*2/100).toFixed(2),
        totalToPay : (parseInt(this.state.sentAmount, 10) + parseFloat(this.state.fees, 10)).toFixed(2)
      })
    }
  }

  renderSentAmount() {
    const styles_amountInput = StyleSheet.flatten(styles.amountInput);
    const {transaction} = this.props;
    return (
      <View>
        <Row >
          <Image
              styleName="rounded-corners"
              style = {{width: 30, height: 30,borderRadius : 10}}
              source={resolveFlag(transaction.senderCountry)}
          />
          <View styleName="vertical  space-between">
            <Subtitle>{transaction.senderCountry}</Subtitle>
            <Caption>Montant à envoyer</Caption>
          </View>
          <Title style={{textAlign:'right'}}>{transaction.senderCurrency}</Title>
        </Row>
        <TextInput 
              style = {styles_amountInput}
              keyboardType={'numeric'}
              placeholder="Montant"
              value={String(this.state.sentAmount)}
              onChangeText={(_value) => {
                this.setState({sentAmount : _value, receivedAmount : _value*656})
              }}
              onEndEditing={() => {
                this.resolveFees(this.state.sentAmount)
              }}
            />
      </View>
    );
  }

  renderReceivedAmount() {
    const styles_amountInput = StyleSheet.flatten(styles.amountInput);
    const {transaction} = this.props;
    return (
      <View>
        <Row >
          <Image
              styleName="rounded-corners"
              style = {{width: 30, height: 30,borderRadius : 10}}
              source={resolveFlag(transaction.country)}
          />
          <View styleName="vertical  space-between">
            <Subtitle>{transaction.country}</Subtitle>
            <Caption>Montant reçu</Caption>
          </View>
          <Title style={{textAlign:'right'}}>{transaction.currency}</Title>
        </Row>
        <TextInput 
              style = {styles_amountInput}
              keyboardType={'numeric'}
              placeholder="Montant"
              value={String(this.state.receivedAmount)}
              onChangeText={(_value) => {
                this.setState({sentAmount : _value, receivedAmount : (_value/656).toFixed(2)})
                }}
              onEndEditing={() => {
                this.resolveFees(this.state.sentAmount)
              }}
            />
      </View>
    );
  }

  renderAmounts() {
    const { navigateTo } = this.props;   
    const { updateTransactionAmount } = this.props; 
    return (
      <View style = {styles.amountContent}>
        {this.renderSentAmount()}
        {this.renderReceivedAmount()}
        <Divider styleName="line" />
        <Row>
            <Subtitle>Commission</Subtitle>
            <Subtitle style={{textAlign:'right'}}>{this.state.fees}</Subtitle>
        </Row>
        <Row>
          <Title>Total à payer</Title>
          <Title style={{textAlign:'right'}}>{this.state.totalToPay}</Title>
        </Row>
        <Button style={{backgroundColor : '#00c85a'}} onPress={() => 
            {
              updateTransactionAmount(this.state.areFeesSupported, this.state.sentAmount, this.state.receivedAmount, this.state.fees, this.state.totalToPay);
              navigateTo('Confirmation')
              this.setState({ visibleModal: null })
            }
          }
          disabled={this.state.sentAmount > 0 ? false : true}
          >
          <Text style={{color : '#fff'}}>ENVOYER</Text>
        </Button>
      </View>
    );
  }

  render() {
    
    return (
      <Screen>
        {this.renderNavigationBar()}
        {this.renderFeePayerSwhitch()}
        {this.renderAmounts()}
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
  switchContent: {
    padding: 10,
    margin : 10,
    borderRadius: 5,
    backgroundColor : 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountContent: {
    padding: 10,
    margin : 10,
    marginTop : 0,
    borderRadius: 5,
    backgroundColor : 'white',
  },
  amountInput: {
    padding: 10,
    borderColor: '#fff',
    textAlign : 'center',
    fontSize : 25,
  },
  validationButton: {
    margin : 10, 
    padding : 10
  }
});


const mapStateToProps = (state) => {
  return {
    transaction : state[ext()].transaction,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateTransactionAmount:  (_areFeesSupported, _sentAmount, _receivedAmount, _fees, _totalToPay) => {
      dispatch({
        type : 'UPDATE_TRANSACTION_AMOUNT',
        areFeesSupported : _areFeesSupported,
        sentAmount : _sentAmount,
        receivedAmount : _receivedAmount,
        fees : _fees,
        totalToPay : _totalToPay
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

export default connect(
      mapStateToProps,
      mapDispatchToProps
    )(AmountSetting)