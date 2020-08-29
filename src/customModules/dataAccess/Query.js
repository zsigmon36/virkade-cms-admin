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
    addUserLegalDoc: function (username, legalTypeCode, agree) {
        //2020-05-30 02:30:57.311
        let curDate = new Date()
        let expYear = curDate.getFullYear() + 1
        let activeDate = `${curDate.getFullYear()}-${curDate.getMonth()+1}-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}.0`
        let expireDate = `${expYear}-${curDate.getMonth()+1}-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}.0`

        let query = `${DataConstants.MUTATION}{${DataConstants.ADD_USER_LEGAL_DOC}
            (   
                ${DataConstants.INPUT_LEGAL}:{
                    ${DataConstants.USERNAME}:"${username}",
                    ${DataConstants.TYPE_CODE}:"${legalTypeCode}",
                    ${DataConstants.AGREE}:${agree},
                    ${DataConstants.ACTIVE_DATE}:"${activeDate}",
                    ${DataConstants.EXPIRE_DATE}:"${expireDate}",
                    ${DataConstants.ENABLED}:true
                }
            ){
                    ${DataConstants.LEGAL_DOC_ID}
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
}