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
        let query = GraphQLMutationParamStrings.addUserSession(session)
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
    updateUser: function (userObj, userToUpdate, callBack) {
        let query = GraphQLMutationParamStrings.updateUser(userToUpdate)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    updateUserType: function (userObj, userToUpdate, callBack) {
        let query = GraphQLMutationParamStrings.updateUserType(userToUpdate)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    addUserAddress: function (userObj, userToUpdate, callback) {
        let query = GraphQLMutationParamStrings.addUserAddress(userToUpdate)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserPhone: function (userObj, userToUpdate, callback) {
        let query = GraphQLMutationParamStrings.addUserPhone(userToUpdate)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserComment: function (userObj, userToUpdate, callback) {
        let query = GraphQLMutationParamStrings.addUserComment(userToUpdate)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUserLegalDoc: function (userObj, userToUpdate, legalTypeCode, agree = true, callback) {
        let query = GraphQLMutationParamStrings.addUserLegalDoc(userToUpdate.username, legalTypeCode, agree)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUpdateLocation: function (userObj, fields, callback) {
        let query = GraphQLMutationParamStrings.addUpdateLocation(fields)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUpdateActivity: function (userObj, fields, callback) {
        let query = GraphQLMutationParamStrings.addUpdateActivity(fields)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    addUpdateTransaction: function (userObj, fields, callback) {
        let query = GraphQLMutationParamStrings.addUpdateTransaction(fields)
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
    getAllFieldsUserById: function (userObj, userId, callBack) {
        let query = GraphQLQueryParamStrings.getAllFieldsUserById(userId)
        return dataFetch(query, userObj.username, userObj.authToken.token, callBack)
    },
    getAllStates: function (userObj, callback) {
        let query = GraphQLQueryParamStrings.getAllStates()
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getAllActivities: function (userObj, callback) {
        let query = GraphQLQueryParamStrings.getAllActivities()
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getAllLocations: function (userObj, callback) {
        let query = GraphQLQueryParamStrings.getAllLocations()
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getLocation: function (userObj, id, callback) {
        let query = GraphQLQueryParamStrings.getLocation(id)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getActivity: function (userObj, id, callback) {
        let query = GraphQLQueryParamStrings.getActivity(id)
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
    getAvailableSessions: function (userObj, filter, callback) {
        let query = GraphQLQueryParamStrings.getAvailableSessions(filter)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getPendingSessions: function (userObj, filter, callback) {
        let query = GraphQLQueryParamStrings.getPendingSessions(filter)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getAllSessions: function (userObj, filter, callback) {
        let query = GraphQLQueryParamStrings.getAllSessions(filter)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    getSessionById: function (userObj, id, callback) {
        let query = GraphQLQueryParamStrings.getSessionById(id)
        return dataFetch(query, userObj.username, userObj.authToken.token, callback)
    },
    checkSession: function (authToken, callBack = undefined) {
        let query = GraphQLQueryParamStrings.checkSession()
        return dataFetch(query, authToken.username, authToken.token, callBack)
    },
    searchUsers: function (userObj, filter, callback) {
        let query = GraphQLQueryParamStrings.searchUsers(filter)
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