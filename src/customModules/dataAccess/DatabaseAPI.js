//connection details - probs move to config file
//const HOST = '192.168.1.240'
const HOST = '192.168.1.7' //move property
const PORT = '136' //move to property
const API_ADDRESS = '/service'
const PROTOCOL = 'http'

//queries
const QUERY = 'query'
const GET_ALL_STATES = 'getAllStates'
const GET_USER_BY_USERNAME = 'getUserByUsername'
const GET_AVAIL_PLAY_SESSIONS = 'getAvailableSessions'
const GET_PENDING_PLAY_SESSIONS = 'getPendingSessions'

//mutations
const MUTATION = 'mutation'
const CREATE_NEW_USER = 'createNewUser'
const UPDATE_USER = 'updateUser'
const CREATE_USER_ADDRESS = 'addUserAddress'
const CREATE_PHONE = 'addPhone'
const SIGN_IN = 'signIn'
const SIGN_OUT = 'signOut'
const ADD_COMMENT = 'addComment'
const ADD_USER_LEGAL_DOC = 'addUserLegalDoc'
const RECOVERY_SIGN_IN = 'recoverySignIn'
const SET_NEW_PASSWORD = 'setNewPassword'
const ADD_USER_SESSION = 'addUserSession'

//params & fields
const TYPE = 'type'
const INPUT_USER = 'inputUser'
const AUTHDATA = 'authData'
const EMAILADDRESS = 'emailAddress'
const USERID = 'userId'
const TYPE_CODE = 'typeCode'
const CODE = 'code'
const ADDRESSID = 'addressId'
const STATUSID = 'statusId'
const STATUS = 'status'
const USERNAME = 'username'
const PASSWORD = 'password'
const SECURITYQ = 'securityQuestion'
const SECURITYA = 'securityAnswer'
const FIRST_NAME = 'firstName'
const LAST_NAME = 'lastName'
const GENDER = 'gender'
const AGE = 'age'
const HEIGHT = 'height'
const WEIGHT = 'weight'
const IDP = 'idp'
const EMAIL_VERIFIED = 'emailVerified'
const PLAYED_BEFORE = 'playedBefore'
const REAL_ESTATE_SERVICE = 'reServices'
const LIABLE_AGREE = 'liableAgree'
const TC_AGREE = 'tcAgree'
const CAN_CONTACT = 'canContact'
const TOKEN = 'token'
const PASSCODE = 'passCode'
const NAME = 'name'
const CREATED_DATE = 'createdDate'

const INPUT_ADDRESS = 'inputAddress'
const ADDRESS = 'address'
const STREET = 'street'
const APT = 'apt'
const STATE = 'state'
const STATE_CODE = 'stateCode'
const STATE_ID = 'stateId'
const UNIT = 'unit'
const CITY = 'city'
const POSTAL_CODE = 'postalCode'

const INPUT_PHONE = 'inputPhone'
const PHONEID = 'phoneId'
const PHONE_COUNTRY_CODE = 'countryCode'
const NUMBER = 'number'
const PHONE_NUMBER = 'phoneNum'
const PHONE_NUMBERS = 'phoneNumbers'

const INPUT_COMMENT = 'inputComment'
const COMMENT_CONTENT = 'commentContent'
const COMMENTID = 'commentId'
const NEW_LINE_TOKEN = '[LF]'

const INPUT_LEGAL = 'inputLegal'
const LEGAL_DOC_ID = 'legalDocId'
const AGREE = 'agree'
const ACTIVE_DATE = 'activeDate'
const EXPIRE_DATE = 'expireDate'
const ENABLED = 'enabled'

const ACTIVITY_NAME = 'activityName'
const ACTIVITY = 'activity'
const LOCATION_NAME= 'locationName'
const LOCATION = 'location'
const START_DATE= 'startDate'
const END_DATE = 'endDate'
const INPUT_PLAY_SESSION = 'inputPlaySession'
const PAYED = 'payed'
const SESSIONID = 'sessionId'
const COST_PER_MIN =  "costpm"
const SETUP_MINUTES = "setupMin"
const TAX_RATE = "taxRate"
const MANAGER = 'manager'

let cmsGraphQLHost = `${PROTOCOL}://${HOST}:${PORT}${API_ADDRESS}`

export const DatabaseAPI = {
    signIn: function (username, password, callBack = undefined) {
        let query = GraphQLParamStrings.signIn(username, password)
        return dataFetch(query, username, authToken = '', callBack)
    },
    signOut: function (authToken, callBack = undefined) {
        let query = GraphQLParamStrings.signOut(authToken.username)
        return dataFetch(query, authToken.username, authToken.token, callBack)
    },
    createNewUser: function (userObj, callBack) {
        let query = GraphQLParamStrings.createNewUser(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    getUserByUserName: function (userObj, callBack) {
        let query = GraphQLParamStrings.getUserByUserName(userObj.username)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    getAllFieldsUserByUserName: function (userObj, callBack) {
        let query = GraphQLParamStrings.getAllFieldsUserByUserName(userObj.username)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    updateUser: function (userObj, callBack) {
        let query = GraphQLParamStrings.updateUser(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    getAllStates: function (userObj, callback) {
        let query = GraphQLParamStrings.getAllStates()
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserAddress: function (userObj, callback) {
        let query = GraphQLParamStrings.addUserAddress(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserPhone: function (userObj, callback) {
        let query = GraphQLParamStrings.addUserPhone(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserComment: function (userObj, callback) {
        let query = GraphQLParamStrings.addUserComment(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserLegalDoc: function (userObj, legalTypeCode, agree = true, callback) {
        let query = GraphQLParamStrings.addUserLegalDoc(userObj.username, legalTypeCode, agree)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    //for recovery pw
    getSecurityQ: function (username, callback) {
        let query = GraphQLParamStrings.getSecurityQ(username)
        return dataFetch(query, username, authToken = '', callback)
    },
    checkSecurityA: function (userObj, callback) {
        let query = GraphQLParamStrings.checkSecurityA(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    setNewPassword: function (userObj, callback) {
        let query = GraphQLParamStrings.setNewPassword(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    //play session creation
    getAvailableSessions: function (userObj, activity, location, callback) {
        let query = GraphQLParamStrings.getAvailableSessions(activity, location)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getPendingSessions: function (userObj, activity, location, callback) {
        let query = GraphQLParamStrings.getPendingSessions(activity, location)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserSession: function (userObj, session, callback) {
        let query = GraphQLParamStrings.addUserSession(userObj, session)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
}

const GraphQLParamStrings = {
    signIn: function (username, password) {
        return `${MUTATION} { ${SIGN_IN}
            (
                ${AUTHDATA}:{
                    ${USERNAME}:\"${username}\",
                    ${PASSWORD}:\"${password}\"
                }
            ){
                ${USERNAME},
                ${TOKEN},
                ${CREATED_DATE}
            }
        }`
    },
    signOut: function (username) {
        return `${MUTATION} { ${SIGN_OUT} ( ${USERNAME}:\"${username}\" ) }`
    },
    createNewUser: function (userObj) {
        let query = `${MUTATION} { ${CREATE_NEW_USER}
            (
                ${EMAILADDRESS}:\"${userObj.emailAddress}\",
                ${AUTHDATA}:{
                    ${USERNAME}:\"${userObj.username}\",
                    ${PASSWORD}:\"${userObj.password}\",
                    ${SECURITYQ}:\"${userObj.securityQuestion}\",
                    ${SECURITYA}:\"${userObj.securityAnswer}\"
                },
                ${FIRST_NAME}:\"${userObj.firstName}\",
                ${LAST_NAME}:\"${userObj.lastName}\"
            ){
                ${USERNAME} 
                ${USERID}
            }}`
        return query; //.replace(/\s/g, '');

    },
    updateUser: function (userObj) {

        let feet = parseInt(userObj.heightFt);
        let inch = parseInt(userObj.heightIn);
        let height = (feet * 12) + inch;
        let age = userObj.age;
        let weight = userObj.weight;

        if (age === '' || age == undefined) {
            age = 0;
        }
        if (weight === '' || age == undefined) {
            weight = 0;
        }

        let query = `${MUTATION}{${UPDATE_USER}
            (   
                ${INPUT_USER}:{
                    ${USERID}:${userObj.userId},
                    ${TYPE_CODE}:\"${userObj.userTypeCode}\",
                    ${STATUSID}:${userObj.statusId},
                    ${EMAILADDRESS}:\"${userObj.emailAddress}\",
                    ${USERNAME}:\"${userObj.username}\",
                    ${PASSWORD}:\"${userObj.password}\",
                    ${SECURITYQ}:\"${userObj.securityQuestion}\",
                    ${SECURITYA}:\"${userObj.securityAnswer}\"
                    ${FIRST_NAME}:\"${userObj.firstName}\",
                    ${LAST_NAME}:\"${userObj.lastName}\",
                    ${GENDER}:\"${userObj.gender}\",
                    ${AGE}:${parseInt(age)},
                    ${HEIGHT}:${height},
                    ${WEIGHT}:${parseInt(weight)},      
                    ${IDP}:${parseFloat(userObj.idp)},
                    ${EMAIL_VERIFIED}:${userObj.emailVerified},
                    ${PLAYED_BEFORE}:${userObj.playedBefore},
                    ${REAL_ESTATE_SERVICE}:${userObj.reServices},
                    ${CAN_CONTACT}:${userObj.canContact},
                }
            ){
                ${USERNAME} 
                ${USERID}
            }}`
        return query; //.replace(/\s/g, '');

    },
    getUserByUserName: function (username) {
        let query = `${QUERY} { ${GET_USER_BY_USERNAME}
            (
                ${USERNAME}:\"${username}\",
            ){
                ${USERNAME} 
                ${USERID}
            }}`
        return query; //.replace(/\s/g, '');

    },
    getAllFieldsUserByUserName: function (username) {
        let query = `${QUERY} { ${GET_USER_BY_USERNAME}
            (
                ${USERNAME}:\"${username}\",
            ){
                ${USERID}
                ${USERNAME} 
                ${TYPE} {
                    ${CODE}
                }
                ${ADDRESS}{
                    ${STATE} {
                        ${STATE_CODE}
                    }
                    ${TYPE}{
                        ${CODE}
                    }
                    ${STREET}
                    ${UNIT}
                    ${APT}
                    ${CITY}
                    ${POSTAL_CODE}
                }
                ${STATUS} {
                    ${STATUSID}
                }
                ${EMAILADDRESS}
                ${PHONE_NUMBERS} {
                    ${NUMBER}
                    ${PHONE_COUNTRY_CODE}
                    ${TYPE} {
                        ${CODE}
                    }
                }
                ${SECURITYQ}
                ${FIRST_NAME}
                ${LAST_NAME}
                ${GENDER}
                ${AGE}
                ${HEIGHT}
                ${WEIGHT}
                ${IDP}
                ${EMAIL_VERIFIED}
                ${PLAYED_BEFORE}
                ${REAL_ESTATE_SERVICE}
                ${CAN_CONTACT}
                ${LIABLE_AGREE}
                ${TC_AGREE}
            }
        }`
        return query; //.replace(/\s/g, '');

    },
    getAllStates: function () {
        let query = `${QUERY} { ${GET_ALL_STATES}
            {
                ${NAME} 
                ${STATE_CODE}
                ${STATE_ID}
            }}`
        return query;
    },
    addUserAddress: function (userObj) {

        let unit = userObj.unit;
        let apt = userObj.apt;
        let street = userObj.street;
        let city = userObj.street;
        let state = userObj.state
        let postalCode = userObj.postalCode

        if (unit == undefined) {
            unit = ''
        }
        if (apt == undefined) {
            apt = ''
        }
        if (street == undefined) {
            street = ''
        }
        if (city == undefined) {
            city = ''
        }
        if (state == undefined) {
            state = ''
        }
        if (postalCode == undefined) {
            postalCode = ''
        }

        let query = `${MUTATION}{${CREATE_USER_ADDRESS}
            (   
                ${INPUT_ADDRESS}:{
                    ${STATE_CODE}:\"${state}\",
                    ${TYPE_CODE}:\"${userObj.addressTypeCode}\",
                    ${STREET}:\"${street}\",
                    ${UNIT}:\"${unit}\",
                    ${APT}:\"${apt}\",
                    ${CITY}:\"${city}\",
                    ${POSTAL_CODE}:\"${postalCode}\",
                }
            ){
                    ${ADDRESSID}
        }}`
        return query;
    },
    addUserPhone: function (userObj) {
        let query = `${MUTATION}{${CREATE_PHONE}
            (   
                ${INPUT_PHONE}:{
                    ${USERNAME}:\"${userObj.username}\",
                    ${TYPE_CODE}:\"${userObj.phoneType}\",
                    ${PHONE_COUNTRY_CODE}:${userObj.phoneCountryCode},
                    ${NUMBER}:\"${userObj.phoneNumber}\",
                }
            ){
                    ${PHONEID} 
                    ${USERID} 
        }}`
        return query;
    },
    addUserComment: function (userObj) {
        let commentContent = (userObj.commentContent).replace(/\n/g, NEW_LINE_TOKEN)
        let query = `${MUTATION}{${ADD_COMMENT}
            (   
                ${INPUT_COMMENT}:{
                    ${USERNAME}:\"${userObj.username}\",
                    ${TYPE_CODE}:\"${userObj.commentType}\",
                    ${COMMENT_CONTENT}:\"${commentContent}\",
                }
            ){
                    ${COMMENTID} 
                    ${USERID} 
        }}`
        return query;
    },
    addUserLegalDoc: function (username, legalTypeCode, agree) {
        //2020-05-30 02:30:57.311
        let curDate = new Date()
        let expYear = curDate.getFullYear() + 1
        let activeDate = `${curDate.getFullYear()}-${curDate.getMonth()+1}-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}.0`
        let expireDate = `${expYear}-${curDate.getMonth()+1}-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}.0`

        let query = `${MUTATION}{${ADD_USER_LEGAL_DOC}
            (   
                ${INPUT_LEGAL}:{
                    ${USERNAME}:\"${username}\",
                    ${TYPE_CODE}:\"${legalTypeCode}\",
                    ${AGREE}:${agree},
                    ${ACTIVE_DATE}:\"${activeDate}\",
                    ${EXPIRE_DATE}:\"${expireDate}\",
                    ${ENABLED}:true
                }
            ){
                    ${LEGAL_DOC_ID}
        }}`
        return query;
    },
    getSecurityQ: function (username) {
        let query = `${QUERY} { ${GET_USER_BY_USERNAME}
            (
                ${USERNAME}:\"${username}\",
            ){
                ${SECURITYQ} 
                ${USERNAME}
                ${EMAILADDRESS}
            }}`
        return query; //.replace(/\s/g, '');

    },
    checkSecurityA: function (userObj) {
        return `${MUTATION} { ${RECOVERY_SIGN_IN}
            (
                ${AUTHDATA}:{
                    ${USERNAME}:\"${userObj.username}\",
                    ${SECURITYA}:\"${userObj.securityAnswer}\"
                }
            )
        }`
    },
    setNewPassword: function (userObj) {
        let query = `${MUTATION} { ${SET_NEW_PASSWORD}
            (
                ${USERNAME}:\"${userObj.username}\",
                ${PASSCODE}:\"${userObj.passcode}\",
                ${PASSWORD}:\"${userObj.password}\"
            )
        }`
        return query; //.replace(/\s/g, '');
    },
    getAvailableSessions: function (activity, location) {
        paramString = ""
        if (activity || location){
            paramString += "("
        }
        if (activity){
            paramString += `${ACTIVITY_NAME}:\"${activity}\",`
        }
        if (location){
            paramString += `${LOCATION_NAME}:\"${location}\"`
        }
        if (activity || location){
            paramString += ")"
        }
        let query = `${QUERY} { ${GET_AVAIL_PLAY_SESSIONS}
                ${paramString}
            {
                ${START_DATE}
                ${END_DATE}
                ${LOCATION}{
                    ${NAME}
                    ${TAX_RATE}
                }
                ${ACTIVITY}{
                    ${NAME}
                    ${COST_PER_MIN}
                    ${SETUP_MINUTES}
                }
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    getPendingSessions: function (activity, location) {
        paramString = ""
        if (activity || location){
            paramString += "("
        }
        if (activity){
            paramString += `${ACTIVITY_NAME}:\"${activity}\",`
        }
        if (location){
            paramString += `${LOCATION_NAME}:\"${location}\"`
        }
        if (activity || location){
            paramString += ")"
        }
        let query = `${QUERY} { ${GET_PENDING_PLAY_SESSIONS}
                ${paramString}
            {
                ${START_DATE}
                ${END_DATE}
                ${USERNAME}
                ${FIRST_NAME}
                ${ACTIVITY}{
                    ${NAME}
                    ${COST_PER_MIN}
                    ${SETUP_MINUTES}
                }${LOCATION}{
                    ${NAME}
                    ${PHONE_NUMBER}
                    ${MANAGER}
                }
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    addUserSession: function (userObj, session) {
        
        let query = `${MUTATION} { ${ADD_USER_SESSION}
            (
                ${INPUT_PLAY_SESSION}: {
                    ${START_DATE}:\"${session.startDate}\",
                    ${END_DATE}:\"${session.endDate}\",
                    ${LOCATION_NAME}:\"${session.location.name}\",
                    ${ACTIVITY_NAME}:\"${session.activity.name}\",
                    ${PAYED}:false,
                    ${USERNAME}:\"${userObj.username}\",
                }
            )
            {
                ${SESSIONID}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
}


const dataFetch = function (queryString, username, authToken, callBack, retries = 0) {

    let qs = cmsGraphQLHost;
    let body = JSON.stringify({ query: queryString });

    fetch(qs, {
        method: 'POST',
        body: body,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken,
            'Username': username
        }
    }).then(response => {
        return response.json()
    }).then(results => {
        let data = results.data;
        let errors = results.errors
        if (callBack) {
            callBack(data, errors)
        } else {
            return results;
        }
    }).catch(error => {
        if (retries > 0) {
            dataFetch(queryString, username, authToken, callBack, --retries)
        } else {
            if (callBack) {
                callBack(error)
            } else {
                return error;
            }
        }
    });
}