//Connecté à Firebase
export const updateConnectionStatus = ({ connected }) => ({
    type: "UPDATE_CONNECTION_STATUS",
    connected
});

//Enregistré comme utilisateur Danapay
export const updateRegistrationStatus = ({ registered }) => ({
    type: "UPDATE_REGISTERED_STATUS",
    registered
});

export const updateContactsLoadingStatus = ({loaded}) => {
    type: "UPDATE_CONTACTS_LOADING_STATUS",
    loaded
}

export const updateTransactionSenderUser = ({ senderGId, senderFirstName, senderName, senderPhoneNum }) => ({
    type: "UPDATE_TRANSACTION_SENDER_USER",
    senderGId,
    senderType,
    senderFirstName,
    senderName,
    senderPhoneNum
});

export const updateTransactionSenderLocation = ({ senderCountry, senderCity, senderFlag, senderCurrency }) => ({
    type: "UPDATE_TRANSACTION_SENDER_LOCATION",
    senderCountry,
    senderCity,
    senderFlag,
    senderCurrency
});

export const updateTransactionUser = ({ gId, firstName, name, phoneNum }) => ({
    type: "UPDATE_TRANSACTION_USER",
    gId,
    firstName,
    name,
    phoneNum
});

export const updateTransactionDestination = ({ country, city, quarter, flag, currency }) => ({
    type: "UPDATE_TRANSACTION_DESTINATION",
    country,
    city,
    quarter,
    flag,
    currency
});

export const updateTransactionAmount = ({ areFeesSupported, sentAmount, receivedAmount, fees, totalToPay }) => ({
    type: "UPDATE_TRANSACTION_AMOUNT",
    areFeesSupported,
    sentAmount,
    receivedAmount, 
    fees, 
    totalToPay
});

export const resetStore = () => {
    type: "RESET_STORE"
}



