import * as DataConstants from "./DataConstants"

export const GraphQLQueryParamStrings = {
    getUserByUserName: function (username) {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_USER_BY_USERNAME}
            (
                ${DataConstants.USERNAME}:"${username}",
            ){
                ${DataConstants.USERNAME} 
                ${DataConstants.USERID}
            }}`
        return query; //.replace(/\s/g, '');

    },
    getAllFieldsUserByUserName: function (username) {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_USER_BY_USERNAME}
            (
                ${DataConstants.USERNAME}:"${username}",
            ){
                ${DataConstants.USERID}
                ${DataConstants.USERNAME} 
                ${DataConstants.TYPE} {
                    ${DataConstants.CODE}
                }
                ${DataConstants.ADDRESS}{
                    ${DataConstants.STATE} {
                        ${DataConstants.STATE_CODE}
                    }
                    ${DataConstants.TYPE}{
                        ${DataConstants.CODE}
                    }
                    ${DataConstants.STREET}
                    ${DataConstants.UNIT}
                    ${DataConstants.APT}
                    ${DataConstants.CITY}
                    ${DataConstants.POSTAL_CODE}
                }
                ${DataConstants.STATUS} {
                    ${DataConstants.STATUSID}
                }
                ${DataConstants.EMAILADDRESS}
                ${DataConstants.PHONE_NUMBERS} {
                    ${DataConstants.NUMBER}
                    ${DataConstants.PHONE_COUNTRY_CODE}
                    ${DataConstants.TYPE} {
                        ${DataConstants.CODE}
                    }
                }
                ${DataConstants.SECURITYQ}
                ${DataConstants.FIRST_NAME}
                ${DataConstants.LAST_NAME}
                ${DataConstants.GENDER}
                ${DataConstants.AGE}
                ${DataConstants.HEIGHT}
                ${DataConstants.WEIGHT}
                ${DataConstants.IDP}
                ${DataConstants.EMAIL_VERIFIED}
                ${DataConstants.PLAYED_BEFORE}
                ${DataConstants.REAL_ESTATE_SERVICE}
                ${DataConstants.CAN_CONTACT}
                ${DataConstants.LIABLE_AGREE}
                ${DataConstants.TC_AGREE}
            }
        }`
        return query; //.replace(/\s/g, '');

    },
    getAllFieldsUserById: function (userId) {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_USER_BY_ID}
            (
                ${DataConstants.USERID}:"${userId}",
            ){
                ${DataConstants.USERID}
                ${DataConstants.USERNAME} 
                ${DataConstants.TYPE} {
                    ${DataConstants.CODE}
                    ${DataConstants.NAME}
                }
                ${DataConstants.ADDRESS}{
                    ${DataConstants.STATE} {
                        ${DataConstants.STATE_CODE}
                        ${DataConstants.STATE_ID}
                        ${DataConstants.NAME}
                    }
                    ${DataConstants.TYPE}{
                        ${DataConstants.CODE}
                        ${DataConstants.NAME}
                    }
                    ${DataConstants.STREET}
                    ${DataConstants.UNIT}
                    ${DataConstants.APT}
                    ${DataConstants.CITY}
                    ${DataConstants.POSTAL_CODE}
                }
                ${DataConstants.STATUS} {
                    ${DataConstants.STATUSID}
                    ${DataConstants.NAME}
                }
                ${DataConstants.EMAILADDRESS}
                ${DataConstants.PHONE_NUMBERS} {
                    ${DataConstants.NUMBER}
                    ${DataConstants.PHONE_COUNTRY_CODE}
                    ${DataConstants.TYPE} {
                        ${DataConstants.CODE}
                        ${DataConstants.NAME}
                    }
                }
                ${DataConstants.SECURITYQ}
                ${DataConstants.FIRST_NAME}
                ${DataConstants.LAST_NAME}
                ${DataConstants.GENDER}
                ${DataConstants.AGE}
                ${DataConstants.HEIGHT}
                ${DataConstants.WEIGHT}
                ${DataConstants.IDP}
                ${DataConstants.EMAIL_VERIFIED}
                ${DataConstants.PLAYED_BEFORE}
                ${DataConstants.REAL_ESTATE_SERVICE}
                ${DataConstants.CAN_CONTACT}
                ${DataConstants.LIABLE_AGREE}
                ${DataConstants.TC_AGREE}
                ${DataConstants.COMMENTS} {
                    ${DataConstants.COMMENT_CONTENT}
                    ${DataConstants.TYPE} {
                        ${DataConstants.NAME}
                        ${DataConstants.CODE}
                    }
                    ${DataConstants.AUDIT} {
                        ${DataConstants.CREATED_AT}
                    }
                }
            }
        }`
        return query; //.replace(/\s/g, '');

    },
    getAllStates: function () {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_ALL_STATES}
            {
                ${DataConstants.NAME} 
                ${DataConstants.STATE_CODE}
                ${DataConstants.STATE_ID}
            }}`
        return query;
    },
    getAllActivities: function () {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_ALL_ACTIVITIES}
            {
                ${DataConstants.ACTIVITY_ID}
                ${DataConstants.NAME} 
            }}`
        return query;
    },
    getAllLocations: function () {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_ALL_LOCATIONS}
            {
                ${DataConstants.LOCATION_ID}
                ${DataConstants.NAME} 
            }}`
        return query;
    },
    getLocation: function (locationId) {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_LOCATION} ( ${DataConstants.LOCATION_ID}: ${locationId} ) {
            ${DataConstants.ADDRESS} {
                ${DataConstants.STREET}
                ${DataConstants.UNIT}
                ${DataConstants.APT}
                ${DataConstants.CITY}
                ${DataConstants.STATE} {
                    ${DataConstants.STATE_ID}
                }
                ${DataConstants.POSTAL_CODE}
            }
            ${DataConstants.NAME}
            ${DataConstants.TAX_RATE}
            ${DataConstants.DESCRIPTION}
            ${DataConstants.PHONE_NUM}
            ${DataConstants.MANAGER}
            ${DataConstants.ENABLED}
        }}`
        return query;
    },
    getActivity: function (activityId) {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_ACTIVITY} ( ${DataConstants.ACTIVITY_ID}: ${activityId} ) {
            ${DataConstants.ACTIVITY_ID}
            ${DataConstants.NAME}
            ${DataConstants.DESCRIPTION}
            ${DataConstants.WEBSITE}
            ${DataConstants.SUPPORT_CONTACT}
            ${DataConstants.COST_PER_MIN}
            ${DataConstants.SETUP_MINUTES}
            ${DataConstants.CREATOR}
            ${DataConstants.ENABLED}
        }}`
        return query;
    },
    getSecurityQ: function (username) {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_USER_BY_USERNAME}
            (
                ${DataConstants.USERNAME}:"${username}",
            ){
                ${DataConstants.SECURITYQ} 
                ${DataConstants.USERNAME}
                ${DataConstants.EMAILADDRESS}
            }}`
        return query; //.replace(/\s/g, '');

    },
    getAvailableSessions: function (filter) {
        let paramString = ""
        if (filter && (filter.selActivityFilter || filter.selLocationFilter)){
            paramString += "("
        }
        if (filter && filter.selActivityFilter){
            paramString += `${DataConstants.ACTIVITY_ID}:${filter.selActivityFilter}`
        }
        if (filter && filter.selLocationFilter){
            if (paramString.length > 1){
                paramString += ","
            }
            paramString += `${DataConstants.LOCATION_ID}:${filter.selLocationFilter}`
        }
        if (filter && (filter.selActivityFilter || filter.selLocationFilter)){
            paramString += ")"
        }
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_AVAIL_PLAY_SESSIONS}
                ${paramString}
            {
                ${DataConstants.START_DATE}
                ${DataConstants.END_DATE}
                ${DataConstants.LOCATION}{
                    ${DataConstants.NAME}
                    ${DataConstants.TAX_RATE}
                }
                ${DataConstants.ACTIVITY}{
                    ${DataConstants.NAME}
                    ${DataConstants.COST_PER_MIN}
                    ${DataConstants.SETUP_MINUTES}
                }
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    getPendingSessions: function (filter) {
        let paramString = ""
        if (filter && (filter.selActivityFilter || filter.selLocationFilter || filter.selPayedFilter)){
            paramString += "("
        }
        if (filter && filter.selActivityFilter){
            paramString += `${DataConstants.ACTIVITY_ID}:${filter.selActivityFilter}`
        }
        if (filter && filter.selLocationFilter){
            if (paramString.length > 1){
                paramString += ","
            }
            paramString += `${DataConstants.LOCATION_ID}:${filter.selLocationFilter}`
        }
        if (filter && filter.selPayedFilter && filter.selPayedFilter !== ''){
            if (paramString.length > 1){
                paramString += ","
            }
            paramString += `${DataConstants.PAYED}:${filter.selPayedFilter === DataConstants.PAYED}`
        }
        if (filter && (filter.selActivityFilter || filter.selLocationFilter || filter.selPayedFilter)){
            paramString += ")"
        }
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_PENDING_PLAY_SESSIONS}
                ${paramString}
            {
                ${DataConstants.SESSIONID}
                ${DataConstants.START_DATE}
                ${DataConstants.END_DATE}
                ${DataConstants.USERID}
                ${DataConstants.USERNAME}
                ${DataConstants.FIRST_NAME}
                ${DataConstants.LAST_NAME}
                ${DataConstants.PAYED}
                ${DataConstants.ACTIVITY}{
                    ${DataConstants.NAME}
                    ${DataConstants.COST_PER_MIN}
                    ${DataConstants.SETUP_MINUTES}
                    ${DataConstants.ACTIVITY_ID}
                }${DataConstants.LOCATION}{
                    ${DataConstants.NAME}
                    ${DataConstants.PHONE_NUMBER}
                    ${DataConstants.MANAGER}
                    ${DataConstants.LOCATION_ID}
                }
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    searchUsers: function (filter) {
        let query = `${DataConstants.QUERY} { ${DataConstants.SEARCH_USERS}
                (
                    ${DataConstants.FIRST_NAME}:"${filter.fnameFilter}",
                    ${DataConstants.LAST_NAME}:"${filter.lnameFilter}",
                    ${DataConstants.EMAILADDRESS}:"${filter.emailFilter}",
                    ${DataConstants.USERNAME}:"${filter.usernameFilter}",
                    ${DataConstants.INPUT_ADDRESS}: {
                        ${DataConstants.STATE_ID}:${filter.selStateFilter?filter.selStateFilter:0},
                        ${DataConstants.STREET}:"${filter.streetFilter}",
                        ${DataConstants.CITY}:"${filter.cityFilter}",
                        ${DataConstants.POSTAL_CODE}:"${filter.zipFilter}"
                    }
                )
            {
                ${DataConstants.USERID}
                ${DataConstants.USERNAME} 
                ${DataConstants.TYPE} {
                    ${DataConstants.CODE}
                    ${DataConstants.NAME}
                }
                ${DataConstants.ADDRESS}{
                    ${DataConstants.STATE} {
                        ${DataConstants.STATE_CODE}
                    }
                    ${DataConstants.STREET}
                    ${DataConstants.UNIT}
                    ${DataConstants.APT}
                    ${DataConstants.CITY}
                    ${DataConstants.POSTAL_CODE}
                }
                ${DataConstants.STATUS} {
                    ${DataConstants.STATUSID}
                    ${DataConstants.NAME}
                }
                ${DataConstants.EMAILADDRESS}
                ${DataConstants.FIRST_NAME}
                ${DataConstants.LAST_NAME}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    checkSession: function () {
        return `${DataConstants.QUERY} { ${DataConstants.CHECK_SESSION} }`
    },
    getAllSessions: function (filter) {
        let paramString = ""
        if (filter && (filter.selActivityFilter || filter.selLocationFilter || filter.selPayedFilter)){
            paramString += "("
        }
        if (filter && filter.selActivityFilter){
            paramString += `${DataConstants.ACTIVITY_ID}:${filter.selActivityFilter}`
        }
        if (filter && filter.selLocationFilter){
            if (paramString.length > 1){
                paramString += ","
            }
            paramString += `${DataConstants.LOCATION_ID}:${filter.selLocationFilter}`
        }
        if (filter && filter.selPayedFilter && filter.selPayedFilter !== ''){
            if (paramString.length > 1){
                paramString += ","
            }
            paramString += `${DataConstants.PAYED}:${filter.selPayedFilter === DataConstants.PAYED}`
        }

        if (filter && (filter.selActivityFilter || filter.selLocationFilter || filter.selPayedFilter)){
            paramString += ")"
        }
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_ALL_PLAY_SESSIONS}
                ${paramString}
            {
                ${DataConstants.SESSIONID}
                ${DataConstants.START_DATE}
                ${DataConstants.END_DATE}
                ${DataConstants.USERID}
                ${DataConstants.USERNAME}
                ${DataConstants.FIRST_NAME}
                ${DataConstants.LAST_NAME}
                ${DataConstants.PAYED}
                ${DataConstants.ACTIVITY}{
                    ${DataConstants.NAME}
                    ${DataConstants.COST_PER_MIN}
                    ${DataConstants.SETUP_MINUTES}
                    ${DataConstants.ACTIVITY_ID}
                }${DataConstants.LOCATION}{
                    ${DataConstants.NAME}
                    ${DataConstants.PHONE_NUMBER}
                    ${DataConstants.MANAGER}
                    ${DataConstants.LOCATION_ID}
                    ${DataConstants.TAX_RATE}
                }${DataConstants.TRANSACTION}{
                    ${DataConstants.TRASACTION_ID}
                    ${DataConstants.SERVICE_NAME}
                    ${DataConstants.DESCRIPTION}
                    ${DataConstants.REF_ID}
                    ${DataConstants.PAYMENT}
                }
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    getAllUserSessions: function (userId, filter) {
        let paramString = ""
        paramString += `(${DataConstants.USERID}:${userId},${DataConstants.DATE_REQUESTED}:"2019-01-01 00:00:00.0"`
        if (filter && filter.selActivityFilter){
            paramString += `, ${DataConstants.ACTIVITY_ID}:${filter.selActivityFilter}`
        }
        if (filter && filter.selLocationFilter){
            paramString += `, ${DataConstants.LOCATION_ID}:${filter.selLocationFilter}`
        }
        if (filter && filter.selPayedFilter && filter.selPayedFilter !== ''){
            paramString += `, ${DataConstants.PAYED}:${filter.selPayedFilter === DataConstants.PAYED}`
        }
            paramString += ")"
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_ALL_USER_PLAY_SESSIONS}
                ${paramString}
            {
                ${DataConstants.SESSIONID}
                ${DataConstants.START_DATE}
                ${DataConstants.END_DATE}
                ${DataConstants.USERID}
                ${DataConstants.USERNAME}
                ${DataConstants.FIRST_NAME}
                ${DataConstants.LAST_NAME}
                ${DataConstants.PAYED}
                ${DataConstants.ACTIVITY}{
                    ${DataConstants.NAME}
                    ${DataConstants.COST_PER_MIN}
                    ${DataConstants.SETUP_MINUTES}
                    ${DataConstants.ACTIVITY_ID}
                }${DataConstants.LOCATION}{
                    ${DataConstants.NAME}
                    ${DataConstants.PHONE_NUMBER}
                    ${DataConstants.MANAGER}
                    ${DataConstants.LOCATION_ID}
                    ${DataConstants.TAX_RATE}
                }${DataConstants.TRANSACTION}{
                    ${DataConstants.TRASACTION_ID}
                    ${DataConstants.SERVICE_NAME}
                    ${DataConstants.DESCRIPTION}
                    ${DataConstants.REF_ID}
                    ${DataConstants.PAYMENT}
                }
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    getSessionById: function (id) {
        let query = `${DataConstants.QUERY} { ${DataConstants.GET_PLAY_SESSION_BY_ID}
               (${DataConstants.SESSIONID}:${id})
            {
                ${DataConstants.SESSIONID}
                ${DataConstants.START_DATE}
                ${DataConstants.END_DATE}
                ${DataConstants.USERID}
                ${DataConstants.USERNAME}
                ${DataConstants.FIRST_NAME}
                ${DataConstants.LAST_NAME}
                ${DataConstants.PAYED}
                ${DataConstants.ACTIVITY}{
                    ${DataConstants.NAME}
                    ${DataConstants.COST_PER_MIN}
                    ${DataConstants.SETUP_MINUTES}
                    ${DataConstants.ACTIVITY_ID}
                }${DataConstants.LOCATION}{
                    ${DataConstants.NAME}
                    ${DataConstants.PHONE_NUMBER}
                    ${DataConstants.MANAGER}
                    ${DataConstants.LOCATION_ID}
                    ${DataConstants.TAX_RATE}
                }${DataConstants.TRANSACTION}{
                    ${DataConstants.TRASACTION_ID}
                    ${DataConstants.SERVICE_NAME}
                    ${DataConstants.DESCRIPTION}
                    ${DataConstants.SESSION_IDS}
                    ${DataConstants.REF_ID}
                    ${DataConstants.PAYMENT}
                }
            }
        }`
        return query; //.replace(/\s/g, '');
    },
}