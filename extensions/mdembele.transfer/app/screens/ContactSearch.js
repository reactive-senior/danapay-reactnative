import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, AsyncStorage } from 'react-native';
import { Title, Tile, Subtitle, Caption, Row, Image, Divider, DropDownMenu, Button, Icon, Screen} from '@shoutem/ui'
import { NavigationBar } from '@shoutem/ui/navigation';

import SearchInput, { createFilter } from 'react-native-search-filter';
import Modal          from 'react-native-modal';
import ActionButton   from 'react-native-action-button';
import Contacts       from 'react-native-contacts';
import loaderHandler      from 'react-native-busy-indicator/LoaderHandler';


import emails         from '../assets/mails';
import { navigateTo } from '@shoutem/core/navigation';
import { connect }    from 'react-redux';
import { ext }        from '../const';
import axios          from 'axios'
import { Confirmation } from './Confirmation';

const KEYS_TO_FILTERS = ['givenName', 'familyName', 'phoneNumbers[0].number'];

var contacts;

export class ContactSearch extends Component {
 constructor(props) {
    super(props);
    this.state = {
      countries: [
        { title: 'Sélectionnez le pays', value: '' },
        { title: 'Mali', value: 'Mali-' },
        { title: 'Niger', value: 'Niger-' },
      ],
      cities: [
        { title: 'Sélectionnez la ville', value: '' },
        { title: 'Bamako', value: 'Bamako-' },
        { title: 'Kayes', value: 'Kayes-' }
      ],
      quarters: [
        { title: 'Sélectionnez le quartier', value: '' },
        { title: 'Magnambougou', value: 'Magnambougou' },
        { title: 'Faladié', value: 'Faladié-' },
        { title: 'Kalaban', value: 'Kalaban-' },
      ],
      searchTerm: '',
      visibleModal: null, 
      contactsLoaded: false,
      selectedCountry: undefined,
      selectedCity: undefined,
      newContactFirstName: undefined,
      newContactName: undefined,
      newContactPhoneNum: undefined,
    }
  }

  componentDidMount()
  {
   this.loadContacts().done()
  }
  
  async loadContacts()
  {
    contacts = await AsyncStorage.getItem('@danapay:contacts')
    if (contacts !== null)
    {
      this.setState({contactsLoaded : true})
    }
  }

  createNewAddressBookContact(firstName, name, phoneNum){
    var contact = {
      familyName: firstName,
      givenName: name,
      phoneNumbers: [{
        label: "mobile",
        number: phoneNum,
      }],
      hasThumbnail: false,
    }
    Contacts.addContact(contact, (err) => {
      if(err !== undefined)
        console.error("Unable to create contact into adress book : "+err)
    })
    Contacts.getAll( async (err, _contacts) => {
      if(err === 'denied') 
        console.log('Unable to access contacts');
      else {
         contacts = JSON.stringify(_contacts);
         try{
          await AsyncStorage.setItem('@danapay:contacts', contacts); 
        } catch(error) {
          console.error("Unable to store contacts into AsyncStorage : "+error)
        }
      }
    });
  }

  getDanapayUser(phoneNum)
  {
    // const { updateTransactionUser } = this.props;
    return new Promise ((resolve, reject) => {
      axios.get('#user/api/getUser?phoneNum='+phoneNum)
      .then(function (response) {
        
        if(response.data.userGettingMessage.endsWith('Unable to find user.'))
        { 
          reject("Utilisateur non inscrit chez Danapay")
        }
        else 
        {
          // alert(response.data.userGettingMessage)
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

  searchUpdated(term) {
    this.setState({ searchTerm: term })
  }

  // getFormatedNumber(phoneNum){
  //   var num = phoneNum.replace(/ /g,'')
  //   if(num.splice(0,3)!="0033" && num.length == 10 && ( num.splice(0,1)=="06" && num.splice(0,3)=="07"))
  //   {
  //     num = "0033"+num.splice(2,9)
  //     return num;
  //   }
  //   return undefined;
  // }

  renderNavigationBar() {
    const { navigateTo } = this.props;
    return (
      <NavigationBar
        hasHistory = {true}
        renderRightComponent = {() => (
          <Button styleName="" style={{paddingTop : 15}} onPress={() => 
            {
              navigateTo('Home')
            }}>
            <Text>Annuler</Text>
          </Button>
        )}
        title="BENEFICIAIRE"
      />
    )
  }

  renderContacts() {
    const {updateTransactionUser} = this.props;
    if(this.state.contactsLoaded === true)
    {
      loaderHandler.hideLoader();
      try {
        contactsArray = JSON.parse(contacts);
        const filteredContacts = contactsArray.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        return (
          filteredContacts.map(contact => {
            return (
              <TouchableOpacity onPress={() => 
                { 
                  this.getDanapayUser(contact.phoneNumbers[0].number)
                  .then((user) => {
                    updateTransactionUser(user.gId, user.fname, user.lname, user.phoneNum)
                    this.setState({ visibleModal: 1 })  
                  })
                  .catch((message)=> {
                    alert(message);
                  })
                  
                }
              } key={contact.recordID} >
                <Divider styleName="line center" style = {{width : 300}}/>
                <Row>
                  <Image
                    styleName="small top"
                    source={{ uri: contact.thumbnailPath }}
                  />
                  <View>
                    <Text style={{fontSize : 15}}>{contact.givenName} {contact.familyName}</Text>
                    <Caption>{contact.phoneNumbers[0].number}</Caption>
                  </View>
                  
                </Row>
                <Divider styleName="line center" style = {{width : 300}}/>
              </TouchableOpacity>)
          }
        ));
      } catch (error) {
        console.log("Error while rendering contacts :"+error);
      }
    }
    else{
      loaderHandler.showLoader("Chargement...")
      return (<Text></Text>)
    }
  }

  renderAddNewContactModal() {
    const { transaction, updateTransactionUser, updateTransactionDestination, navigateTo } = this.props;
    return(
      <View styleName="">
          <Modal
            isVisible={this.state.visibleModal === 0}
            onBackdropPress={() => this.setState({ visibleModal: null })}
            style={{backgroundColor : 'white'}}
            >
            <Row styleName="small">
              <Subtitle>Ajouter un nouveau destinataire</Subtitle>
              <Icon styleName="disclosure" name="close" onPress={() => this.setState({ visibleModal: null })}/>
            </Row>
            <View style={{margin: 10, marginTop : 0, borderRadius : 10}}>
            <Image
              styleName="large-banner"
              source={require('../assets/background.jpg')}>
              <Tile styleName="clear horizontal text-centric" style={{marginLeft : -55}}>
                <Image
                  styleName="medium-avatar sm-gutter-bottom"
                  source={{ uri: 'https://shoutem.github.io/img/ui-toolkit/examples/image-6.png' }}
                  style = {{width: 75, height: 75}}      
                />
                <TextInput 
                  style={{width:200, textAlign:'center'}} 
                  placeholder="Nom Prénom" 
                  onChangeText={(text) => {
                    var names = String(text).split(' ');
                    this.setState({newContactName : names[0], newContactFirstName : names[1]})
                    }}
                />
                <TextInput 
                  style={{width:200, textAlign:'center'}} 
                  placeholder="Numéro de téléphone" 
                  onChangeText={(text => 
                    this.setState({newContactPhoneNum : String(text)})
                  )}
                />
              </Tile>
            </Image>
          </View>
          <View style={{padding :15, margin: 10, marginTop : 10, borderRadius : 5, backgroundColor : '#ededed'}}>
            <Title styleName='h-center'>Lieu de retrait des fonds</Title>
            <View styleName="md-gutter-top">
              <DropDownMenu
                  options={this.state.countries}
                  selectedOption={this.state.selectedCountry ? this.state.selectedCountry : this.state.countries[0]}
                  // selectedOption={this.state.selectedCountry ? this.state.selectedCountry : () => {this.setState({ selectedCountry: this.state.countries.filter(createFilter(transaction.country, "title"))[0] }); return this.state.countries.filter(createFilter(transaction.country, "title"))[0]}}
                  onOptionSelected={(country) => this.setState({ selectedCountry: country })}
                  titleProperty="title"
                  valueProperty="value"
                />
            </View>
            <View styleName="md-gutter-top">
              <DropDownMenu
                  options={this.state.cities}
                  selectedOption={this.state.selectedCity ? this.state.selectedCity : this.state.cities[0]}
                  onOptionSelected={(city) => this.setState({ selectedCity: city })}
                  titleProperty="title"
                  valueProperty="value"
                />
            </View>
            <View styleName="md-gutter-top">
              <DropDownMenu
                  options={this.state.quarters}
                  selectedOption={this.state.selectedQuarter ? this.state.selectedQuarter : this.state.quarters[0]}
                  onOptionSelected={(quarter) => this.setState({ selectedQuarter: quarter })}
                  titleProperty="title"
                  valueProperty="value"
                />
            </View>
          </View>
            <View style={{margin : 10, marginTop : 5}}>
              <Button style={{padding: 10, backgroundColor : '#00c85a'}} onPress={() => {
                  // alert(this.state.newContactFirstName + " " + this.state.newContactName + " " + this.state.newContactPhoneNum);
                  
                  if(this.state.newContactName === undefined || this.state.newContactName === "") alert("Saisissez un Nom et un Prénom")
                  else if(this.state.newContactFirstName === undefined || this.state.newContactFirstName === "") alert("Saisissez un Nom et un Prénom")
                  else if(this.state.newContactPhoneNum === undefined || this.state.newContactPhoneNum === "") alert("Saisissez un Numéro de téléphone")
                  else {
                    this.createNewAddressBookContact(this.state.newContactFirstName, this.state.newContactName, this.state.newContactPhoneNum);
                    updateTransactionUser(this.state.newContactFirstName, this.state.newContactName, this.state.newContactPhoneNum)
                    
                    updateTransactionDestination(this.state.selectedCountry.title, this.state.selectedCity.title, this.state.selectedQuarter.title, "../assets/flags/Mali.png", "CFA");
                    navigateTo('AmountSetting');
                    this.setState({ visibleModal: null });
                  }
                  }}>
                <Text style={{color : '#fff'}}>AJOUTER</Text>
              </Button>
            </View>
          </Modal>
      </View>  
    );  
  }

  renderSelectedContactModal() {
    const { navigateTo } = this.props;
    const { transaction } = this.props;
    const { updateTransactionDestination } = this.props;

    return (
      <View styleName="flexible">
        <Modal
          isVisible={this.state.visibleModal === 1}
          onBackdropPress={() => this.setState({ visibleModal: null })}
          style={{backgroundColor : 'white'}}
          >
          <Row styleName="small">
            <Subtitle>Informations sur le bénéficiaire</Subtitle>
            <Icon styleName="disclosure" name="close" onPress={() => this.setState({ visibleModal: null })}/>
          </Row>
          <View style={{margin: 10, marginTop : 0, borderRadius : 10}}>
            <Image
              styleName="large-banner"
              source={require('../assets/background.jpg')}>
              <Tile styleName="clear horizontal text-centric" style={{marginLeft : -55}}>
                <Image
                  styleName="medium-avatar"
                  source={{ uri: 'https://shoutem.github.io/img/ui-toolkit/examples/image-6.png' }}
                  style = {{width: 75, height: 75}}      
                />
                <View styleName="vertical space-between">
                  <Title>{transaction.firstName} {transaction.name}</Title>
                  <Caption>{transaction.phoneNum}</Caption>
                </View>
              </Tile>
            </Image>
          </View>
          <View style={{padding :15, margin: 10, marginTop : 10, borderRadius : 5, backgroundColor : '#ededed'}}>
            <Title styleName='h-center'>Lieu de retrait des fonds</Title>
            <View styleName="md-gutter-top">
              <DropDownMenu
                  options={this.state.countries}
                  selectedOption={this.state.selectedCountry ? this.state.selectedCountry : this.state.countries[0]}                  
                  onOptionSelected={(country) => this.setState({ selectedCountry: country })}
                  titleProperty="title"
                  valueProperty="value"
                />
            </View>
            <View styleName="md-gutter-top">
              <DropDownMenu
                  options={this.state.cities}
                  selectedOption={this.state.selectedCity ? this.state.selectedCity : this.state.cities[0]}
                  onOptionSelected={(city) => this.setState({ selectedCity: city })}
                  titleProperty="title"
                  valueProperty="value"
                />
            </View>
            <View styleName="md-gutter-top">
              <DropDownMenu
                  options={this.state.quarters}
                  selectedOption={this.state.selectedQuarter ? this.state.selectedQuarter : this.state.quarters[0]}
                  onOptionSelected={(quarter) => this.setState({ selectedQuarter: quarter })}
                  titleProperty="title"
                  valueProperty="value"
                />
            </View>
          </View>
          <View style={{margin : 10, marginTop : 5}}>
            <Button style={{padding: 10, backgroundColor : '#00c85a'}} onPress={() => 
              {
                updateTransactionDestination(this.state.selectedCountry.title, this.state.selectedCity.title, this.state.selectedQuarter.title, "../assets/flags/Mali.png", "CFA");
                navigateTo('AmountSetting');
                this.setState({ visibleModal: null });
                
            }}>
              <Text style={{color : '#fff'}}>VALIDER</Text>
            </Button>
          </View>
        </Modal>
      </View>
    );
  }

  renderAddContactButon(){
    return(
      <ActionButton buttonColor="#00c85a" style={{paddingTop : 150}} onPress={() => this.setState({ visibleModal: 0 })}>
        {/* <ActionButton.Item buttonColor='#00c85a' title="New Task" onPress={() => console.log("notes tapped!")}>
          <Icon style={styles.actionButtonIcon} />
        </ActionButton.Item> */}
      </ActionButton>
    );
  }


  render() {
    
    return (
      <Screen>
        {this.renderNavigationBar()}
        <View style={styles.container}>
          <View style={{padding : 20}}>
            {/* <Icon name="search" /> */}
            <SearchInput 
              onChangeText={(term) => { this.searchUpdated(term) }} 
              style={styles.searchInput}
              placeholder="Saisissez un nom ou numéro de mobile"
            />
            
          </View>
          <ScrollView>
            {this.renderContacts()}
          </ScrollView>
          {this.renderAddContactButon()}
          {this.renderSelectedContactModal()}
          {this.renderAddNewContactModal()}
        </View>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start'
  },
  emailItem:{
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.3)',
    padding: 10
  },
  emailphoneNumber: {
    color: 'rgba(0,0,0,0.5)'
  },
  searchInput:{
    padding: 10,
    color: '#00c85a',
    borderColor: '#fff',
    borderWidth: 1,
    textAlign : 'center',
    fontSize : 15
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  },
});

const mapStateToProps = (state) => {
  return {
    transaction : state[ext()].transaction,
    contactsLoadingStatus : state[ext()].contacts,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateTransactionUser : (_gId, _firstName, _name, _phoneNum) => {
      // alert(_gId)
      dispatch({
        type: "UPDATE_TRANSACTION_USER",
        gId : _gId,
        firstName :  _firstName,
        name : _name,
        phoneNum : _phoneNum
      });
    },
    updateTransactionDestination : (_country, _city, _quarter, _flag, _currency) => {
      dispatch({
        type : 'UPDATE_TRANSACTION_DESTINATION',
        country : _country,
        city : _city,
        quarter : _quarter,  
        flag : _flag,
        currency : _currency    
      });
    },
    updateContactsLoadingStatus : ({_loaded}) => {
      dispatch({
        type: "UPDATE_CONTACTS_LOADING_STATUS",
        loaded : _loaded
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
    )(ContactSearch)