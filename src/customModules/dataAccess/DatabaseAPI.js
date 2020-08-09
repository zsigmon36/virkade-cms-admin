import * as DataConstants from "./DataConstants"
import { GraphQLQueryParamStrings } from "./Query"
import { GraphQLMutationParamStrings } from "./Mutation"


let cmsGraphQLHost = `${DataConstants.PROTOCOL}://${DataConstants.HOST}:${DataConstants.PORT}${DataConstants.API_ADDRESS}`

export const DatabaseAPI = {
    //Mutations
    signIn: function (username, password, callBack = undefined) {
        let query = GraphQLMutationParamStrings.signIn(username, password)
        return dataFetch(query, username, '', callBack)
    },
    signOut: function (authToken, callBack = undefined) {
        let query = GraphQLMutationParamStrings.signOut(authToken.username)
        return dataFetch(query, authToken.username, authToken.token, callBack)
    },
    addUserSession: function (userObj, session, callback) {
        let query = GraphQLMutationParamStrings.addUserSession(userObj, session)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    setNewPassword: function (userObj, callback) {
        let query = GraphQLMutationParamStrings.setNewPassword(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    createNewUser: function (userObj, callBack) {
        let query = GraphQLMutationParamStrings.createNewUser(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    updateUser: function (userObj, callBack) {
        let query = GraphQLMutationParamStrings.updateUser(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    addUserAddress: function (userObj, callback) {
        let query = GraphQLMutationParamStrings.addUserAddress(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserPhone: function (userObj, callback) {
        let query = GraphQLMutationParamStrings.addUserPhone(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserComment: function (userObj, callback) {
        let query = GraphQLMutationParamStrings.addUserComment(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserLegalDoc: function (userObj, legalTypeCode, agree = true, callback) {
        let query = GraphQLMutationParamStrings.addUserLegalDoc(userObj.username, legalTypeCode, agree)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },

    //Queries 
    getUserByUserName: function (userObj, callBack) {
        let query = GraphQLQueryParamStrings.getUserByUserName(userObj.username)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    getAllFieldsUserByUserName: function (userObj, callBack) {
        let query = GraphQLQueryParamStrings.getAllFieldsUserByUserName(userObj.username)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    getAllStates: function (userObj, callback) {
        let query = GraphQLQueryParamStrings.getAllStates()
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getSecurityQ: function (username, callback) {
        let query = GraphQLQueryParamStrings.getSecurityQ(username)
        return dataFetch(query, username, '', callback)
    },
    checkSecurityA: function (userObj, callback) {
        let query = GraphQLQueryParamStrings.checkSecurityA(userObj)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getAvailableSessions: function (userObj, activity, location, callback) {
        let query = GraphQLQueryParamStrings.getAvailableSessions(activity, location)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getPendingSessions: function (userObj, activity, location, callback) {
        let query = GraphQLQueryParamStrings.getPendingSessions(activity, location)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
}

const dataFetch = function (queryString, username, authToken, callBack, retries = 0) {

    let qs = cmsGraphQLHost;
    let body = JSON.stringify({ query: queryString });

    fetch(qs, {
        method: 'POST',
        mode: 'cors',
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