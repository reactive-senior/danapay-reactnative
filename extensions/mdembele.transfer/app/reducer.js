import { combineReducers } from 'redux';

const connectionInitialState = {
    connected : false,
}

const registrationInitialState = {
    registered : false,
}

const contactsInitialState = {
    loaded : false
}

const transactionInitialState = {
    areFeesSupported : true,
    country : "Mali",
    city : "Bamako"
}

const connectionReducer = (state = connectionInitialState, action) => {
    switch(action.type) {
        case 'UPDATE_CONNECTION_STATUS' : 
            state = {
                ...state,
                connected : action.connected
            }
            break;
        }
    return state;
}

const registrationReducer = (state = registrationInitialState, action) => {
    switch(action.type) {
        case 'UPDATE_REGISTERED_STATUS' : 
            state = {
                ...state,
                registered : action.registered
            }
            break;
        }
    return state;
}

const contactsReducer = (state = contactsInitialState, action) => {
    switch(action.type) {
        case 'UPDATE_CONTACTS_LOADING_STATUS' : 
            state = {
                ...state,
                loaded : action.loaded
            }
        break;
    }
    return state;
}

const transactionReducer = (state = transactionInitialState, action) => {
    switch(action.type) {
        case 'UPDATE_TRANSACTION_SENDER_USER' : 
            state = {
                ...state,
                senderGId : action.senderGId,
                senderType : action.senderType,
                senderFirstName : action.senderFirstName,
                senderName : action.senderName,
                senderPhoneNum : action.senderPhoneNum,
            }
            break;
        case 'UPDATE_TRANSACTION_SENDER_LOCATION' : 
            state = {
                ...state,
                senderCountry : action.senderCountry,
                senderCity : action.senderCity,
                senderFlag : action.senderFlag,
                senderCurrency : action.senderCurrency
            }
            break;
        case 'UPDATE_TRANSACTION_USER' : 
            state = {
                ...state,
                gId : action.gId,
                firstName : action.firstName,
                name : action.name,
                phoneNum : action.phoneNum
            }
            break;
        case 'UPDATE_TRANSACTION_DESTINATION' : 
            state = {
                ...state,
                country : action.country,
                city : action.city,
                quarter : action.quarter,
                flag : action.flag,
                currency : action.currency
            }
            break;
        case 'UPDATE_TRANSACTION_AMOUNT' : 
            state = {
                ...state,
                areFeesSupported : action.areFeesSupported,
                sentAmount : action.sentAmount,
                receivedAmount : action.receivedAmount,
                fees : action.fees,
                totalToPay : action.totalToPay
            }
            break;
    }
    return state;
}

const resetStoreReducer = (state = connectionInitialState, action) => {
    switch(action.type) {
        case 'RESET_STORE' : 
            state = {
                ...state,
                connected : true,
                loaded : false,
                senderFirstName : undefined,
                senderName : undefined,
                senderPhoneNum : undefined,
                senderCountry : undefined,
                senderCity : undefined,
                senderFlag : undefined,
                senderCurrency : undefined,
                firstName : undefined,
                name : undefined,
                phoneNum : undefined,
                country : 'Mali',
                city : 'Bamako',
                quarter : undefined,
                flag : undefined,
                currency : undefined,
                areFeesSupported : true,
                sentAmount : undefined,
                receivedAmount : undefined,
                fees : undefined,
                totalToPay : undefined
            }
            break;
        }
    return state;
}


export default combineReducers({
    connection : connectionReducer,
    registration : registrationReducer,
    contacts : contactsReducer,
    transaction : transactionReducer, 
    resetStore : resetStoreReducer,
  });
