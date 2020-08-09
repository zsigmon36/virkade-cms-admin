import * as DataConstants from "./DataConstants"

export const GraphQLMutationParamStrings = {
    signIn: function (username, password) {
        return `${DataConstants.MUTATION} { ${DataConstants.SIGN_IN}
            (
                ${DataConstants.AUTHDATA}:{
                    ${DataConstants.USERNAME}:"${username}",
                    ${DataConstants.PASSWORD}:"${password}"
                }
            ){
                ${DataConstants.USERNAME},
                ${DataConstants.TOKEN},
                ${DataConstants.CREATED_DATE}
            }
        }`
    },
    signOut: function (username) {
        return `${DataConstants.MUTATION} { ${DataConstants.SIGN_OUT} ( ${DataConstants.USERNAME}:"${username}" ) }`
    },
    createNewUser: function (userObj) {
        let query = `${DataConstants.MUTATION} { ${DataConstants.CREATE_NEW_USER}
            (
                ${DataConstants.EMAILADDRESS}:"${userObj.emailAddress}",
                ${DataConstants.AUTHDATA}:{
                    ${DataConstants.USERNAME}:"${userObj.username}",
                    ${DataConstants.PASSWORD}:"${userObj.password}",
                    ${DataConstants.SECURITYQ}:"${userObj.securityQuestion}",
                    ${DataConstants.SECURITYA}:"${userObj.securityAnswer}"
                },
                ${DataConstants.FIRST_NAME}:"${userObj.firstName}",
                ${DataConstants.LAST_NAME}:"${userObj.lastName}"
            ){
                ${DataConstants.USERNAME} 
                ${DataConstants.USERID}
            }}`
        return query; //.replace(/\s/g, '');

    },
    updateUser: function (userObj) {

        let feet = parseInt(userObj.heightFt);
        let inch = parseInt(userObj.heightIn);
        let height = (feet * 12) + inch;
        let age = userObj.age;
        let weight = userObj.weight;

        if (age === '' || age === undefined) {
            age = 0;
        }
        if (weight === '' || age === undefined) {
            weight = 0;
        }

        let query = `${DataConstants.MUTATION}{${DataConstants.UPDATE_USER}
            (   
                ${DataConstants.INPUT_USER}:{
                    ${DataConstants.USERID}:${userObj.userId},
                    ${DataConstants.TYPE_CODE}:"${userObj.userTypeCode}",
                    ${DataConstants.STATUSID}:${userObj.statusId},
                    ${DataConstants.EMAILADDRESS}:"${userObj.emailAddress}",
                    ${DataConstants.USERNAME}:"${userObj.username}",
                    ${DataConstants.PASSWORD}:"${userObj.password}",
                    ${DataConstants.SECURITYQ}:"${userObj.securityQuestion}",
                    ${DataConstants.SECURITYA}:"${userObj.securityAnswer}"
                    ${DataConstants.FIRST_NAME}:"${userObj.firstName}",
                    ${DataConstants.LAST_NAME}:"${userObj.lastName}",
                    ${DataConstants.GENDER}:"${userObj.gender}",
                    ${DataConstants.AGE}:${parseInt(age)},
                    ${DataConstants.HEIGHT}:${height},
                    ${DataConstants.WEIGHT}:${parseInt(weight)},      
                    ${DataConstants.IDP}:${parseFloat(userObj.idp)},
                    ${DataConstants.EMAIL_VERIFIED}:${userObj.emailVerified},
                    ${DataConstants.PLAYED_BEFORE}:${userObj.playedBefore},
                    ${DataConstants.REAL_ESTATE_SERVICE}:${userObj.reServices},
                    ${DataConstants.CAN_CONTACT}:${userObj.canContact},
                }
            ){
                ${DataConstants.USERNAME} 
                ${DataConstants.USERID}
            }}`
        return query; //.replace(/\s/g, '');

    },
    addUserAddress: function (userObj) {

        let unit = userObj.unit;
        let apt = userObj.apt;
        let street = userObj.street;
        let city = userObj.street;
        let state = userObj.state
        let postalCode = userObj.postalCode

        if (unit === undefined) {
            unit = ''
        }
        if (apt === undefined) {
            apt = ''
        }
        if (street === undefined) {
            street = ''
        }
        if (city === undefined) {
            city = ''
        }
        if (state === undefined) {
            state = ''
        }
        if (postalCode === undefined) {
            postalCode = ''
        }

        let query = `${DataConstants.MUTATION}{${DataConstants.CREATE_USER_ADDRESS}
            (   
                ${DataConstants.INPUT_ADDRESS}:{
                    ${DataConstants.STATE_CODE}:"${state}",
                    ${DataConstants.TYPE_CODE}:"${userObj.addressTypeCode}",
                    ${DataConstants.STREET}:"${street}",
                    ${DataConstants.UNIT}:"${unit}",
                    ${DataConstants.APT}:"${apt}",
                    ${DataConstants.CITY}:"${city}",
                    ${DataConstants.POSTAL_CODE}:"${postalCode}",
                }
            ){
                    ${DataConstants.ADDRESSID}
        }}`
        return query;
    },
    addUserPhone: function (userObj) {
        let query = `${DataConstants.MUTATION}{${DataConstants.CREATE_PHONE}
            (   
                ${DataConstants.INPUT_PHONE}:{
                    ${DataConstants.USERNAME}:"${userObj.username}",
                    ${DataConstants.TYPE_CODE}:"${userObj.phoneType}",
                    ${DataConstants.PHONE_COUNTRY_CODE}:${userObj.phoneCountryCode},
                    ${DataConstants.NUMBER}:"${userObj.phoneNumber}",
                }
            ){
                    ${DataConstants.PHONEID} 
                    ${DataConstants.USERID} 
        }}`
        return query;
    },
    addUserComment: function (userObj) {
        let commentContent = (userObj.commentContent).replace(/\n/g, DataConstants.NEW_LINE_TOKEN)
        let query = `${DataConstants.MUTATION}{${DataConstants.ADD_COMMENT}
            (   
                ${DataConstants.INPUT_COMMENT}:{
                    ${DataConstants.USERNAME}:"${userObj.username}",
                    ${DataConstants.TYPE_CODE}:"${userObj.commentType}",
                    ${DataConstants.COMMENT_CONTENT}:"${commentContent}",
                }
            ){
                    ${DataConstants.COMMENTID} 
                    ${DataConstants.USERID} 
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
    checkSecurityA: function (userObj) {
        return `${DataConstants.MUTATION} { ${DataConstants.RECOVERY_SIGN_IN}
            (
                ${DataConstants.AUTHDATA}:{
                    ${DataConstants.USERNAME}:"${userObj.username}",
                    ${DataConstants.SECURITYA}:"${userObj.securityAnswer}"
                }
            )
        }`
    },
    setNewPassword: function (userObj) {
        let query = `${DataConstants.MUTATION} { ${DataConstants.SET_NEW_PASSWORD}
            (
                ${DataConstants.USERNAME}:"${userObj.username}",
                ${DataConstants.PASSCODE}:"${userObj.passcode}",
                ${DataConstants.PASSWORD}:"${userObj.password}"
            )
        }`
        return query; //.replace(/\s/g, '');
    },
    addUserSession: function (userObj, session) {
        
        let query = `${DataConstants.MUTATION} { ${DataConstants.ADD_USER_SESSION}
            (
                ${DataConstants.INPUT_PLAY_SESSION}: {
                    ${DataConstants.START_DATE}:"${session.startDate}",
                    ${DataConstants.END_DATE}:"${session.endDate}",
                    ${DataConstants.LOCATION_NAME}:"${session.location.name}",
                    ${DataConstants.ACTIVITY_NAME}:"${session.activity.name}",
                    ${DataConstants.PAYED}:false,
                    ${DataConstants.USERNAME}:"${userObj.username}",
                }
            )
            {
                ${DataConstants.SESSIONID}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
}