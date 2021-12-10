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
                    ${DataConstants.USERID}:${userObj.selUserId},
                    ${DataConstants.TYPE_CODE}:"${userObj.typeCode}",
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
                    ${DataConstants.ACCOUNT_VERIFIED}:${userObj.accountVerified},
                    ${DataConstants.PLAYED_BEFORE}:${userObj.playedBefore},
                    ${DataConstants.TC_AGREE}:${userObj.tcAgree},
                    ${DataConstants.LIABLE_AGREE}:${userObj.liableAgree},
                    ${DataConstants.REAL_ESTATE_SERVICE}:${userObj.reServices},
                    ${DataConstants.CAN_CONTACT}:${userObj.canContact},
                }
            ){
                ${DataConstants.USERNAME} 
                ${DataConstants.USERID}
            }}`
        return query; //.replace(/\s/g, '');

    },
    updateUserType: function (userObj) {
        let query = `${DataConstants.MUTATION}{${DataConstants.UPDATE_USER_TYPE}
            (   
                ${DataConstants.USERID}:${userObj.selUserId},
                ${DataConstants.TYPE_CODE}:"${userObj.typeCode}",
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
        let city = userObj.city;
        let state = userObj.selState
        let postalCode = userObj.postalCode
        if (state === undefined || state === null) {
            state = 0
        }
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
            state = 0
        }
        if (postalCode === undefined) {
            postalCode = ''
        }

        let query = `${DataConstants.MUTATION}{${DataConstants.CREATE_USER_ADDRESS}
            (   
                ${DataConstants.USERID}:${userObj.userId},
                ${DataConstants.INPUT_ADDRESS}:{
                    ${DataConstants.STATE_ID}:${state},
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
                    ${DataConstants.TYPE_CODE}:"${userObj.phoneTypeCode}",
                    ${DataConstants.PHONE_COUNTRY_CODE}:${userObj.countryCode},
                    ${DataConstants.NUMBER}:"${userObj.number}",
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
        let activeDate = `${curDate.getFullYear()}-${curDate.getMonth() + 1}-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}.0`
        let expireDate = `${expYear}-${curDate.getMonth() + 1}-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}.0`

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
    addUserSession: function (session) {

        let query = `${DataConstants.MUTATION} { ${DataConstants.ADD_USER_SESSION}
            (
                ${DataConstants.INPUT_PLAY_SESSION}: {
                    ${DataConstants.START_DATE}:"${session.startDate}",
                    ${DataConstants.END_DATE}:"${session.endDate}",
                    ${DataConstants.LOCATION_NAME}:"${session.location.name}",
                    ${DataConstants.ACTIVITY_NAME}:"${session.activity.name}",
                    ${DataConstants.PAYED}:false,
                    ${DataConstants.USERNAME}:"${session.username}"
                    ${DataConstants.DISPLAY_NAME}:"${session.displayName}"
                }
            )
            {
                ${DataConstants.SESSIONID}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    updateUserSession: function (fields) {

        let query = `${DataConstants.MUTATION} { ${DataConstants.UPDATE_USER_SESSION}
            (
                ${DataConstants.INPUT_PLAY_SESSION}: {
                    ${DataConstants.SESSIONID}:${fields.sessionId},
                    ${DataConstants.TRASACTION_ID}:${fields.transactionId},
                    ${DataConstants.START_DATE}:"${fields.startDate}",
                    ${DataConstants.END_DATE}:"${fields.endDate}",
                    ${DataConstants.LOCATION_NAME}:"${fields.locationName}",
                    ${DataConstants.ACTIVITY_NAME}:"${fields.activityName}",
                    ${DataConstants.PAYED}:${fields.payed},
                    ${DataConstants.USERNAME}:"${fields.username}"
                    ${DataConstants.DISPLAY_NAME}:"${fields.displayName}"
                }
            )
            {
                ${DataConstants.SESSIONID}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    deleteUserSession: function (id) {
        let query = `${DataConstants.MUTATION} { ${DataConstants.DELETE_USER_SESSION}
               (${DataConstants.SESSIONID}:${id})
            {
                ${DataConstants.SESSIONID}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    addUpdateLocation: function (fields) {
        let query = `${DataConstants.MUTATION} { ${DataConstants.ADD_UPDATE_LOCATION}
                (
                    ${DataConstants.INPUT_LOCATION}: {
                        ${DataConstants.LOCATION_ID}:${fields.selLocationFilter ? fields.selLocationFilter : 0},
                        ${DataConstants.TAX_RATE}:${fields.locationTaxRate},
                        ${DataConstants.NAME}:"${fields.locationName}",
                        ${DataConstants.DESCRIPTION}:"${fields.locationDescription}",
                        ${DataConstants.PHONE_NUM}:"${fields.locationPhoneNum}",
                        ${DataConstants.MANAGER}:"${fields.locationManager}",
                        ${DataConstants.STATE_ID}:${fields.locationSelState ? fields.locationSelState : 0},
                        ${DataConstants.STREET}:"${fields.locationStreet}",
                        ${fields.locationUnit.length > 0 ? `${DataConstants.UNIT}:"${fields.locationUnit}",` : ""}
                        ${fields.locationApt.length > 0 ? `${DataConstants.APT}:"${fields.locationApt}",` : ""}
                        ${DataConstants.CITY}:"${fields.locationCity}",
                        ${DataConstants.POSTAL_CODE}:"${fields.locationZip}",
                        ${DataConstants.ENABLED}:${fields.locationEnabled}
                    }
                )
            {
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
                ${DataConstants.LOCATION_ID}
                ${DataConstants.NAME}
                ${DataConstants.TAX_RATE}
                ${DataConstants.DESCRIPTION}
                ${DataConstants.PHONE_NUM}
                ${DataConstants.MANAGER}
                ${DataConstants.ENABLED}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    addUpdateActivity: function (fields) {
        let query = `${DataConstants.MUTATION} { ${DataConstants.ADD_UPDATE_ACTIVITY}
                (
                    ${DataConstants.INPUT_ACTIVITY}: {
                        ${DataConstants.ACTIVITY_ID}:${fields.selActivityFilter ? fields.selActivityFilter : 0},
                        ${DataConstants.NAME}:"${fields.activityName}",
                        ${DataConstants.DESCRIPTION}:"${fields.activityDescription}",
                        ${DataConstants.WEBSITE}:"${fields.activityWebsite}",
                        ${DataConstants.SUPPORT_CONTACT}:"${fields.activitySupportContact}",
                        ${DataConstants.COST_PER_MIN}:${fields.activityCostPerMin ? fields.activityCostPerMin : 0},
                        ${DataConstants.SETUP_MINUTES}:${fields.activitySetupMin ? fields.activitySetupMin : 0},
                        ${DataConstants.CREATOR}:"${fields.activityCreator}",
                        ${DataConstants.ENABLED}:${fields.activityEnabled}
                    }
                )
            {
                ${DataConstants.ACTIVITY_ID}
                ${DataConstants.NAME}
                ${DataConstants.DESCRIPTION}
                ${DataConstants.WEBSITE}
                ${DataConstants.SUPPORT_CONTACT}
                ${DataConstants.COST_PER_MIN}
                ${DataConstants.SETUP_MINUTES}
                ${DataConstants.CREATOR}
                ${DataConstants.ENABLED}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
    addUpdateTransaction: function (fields) {
        let transactionId = 0
        if (fields.transactionId > 0){
            transactionId = fields.transactionId
        }

        let cleanDesc = (fields.paymentDescription).replace(/\n/g, DataConstants.NEW_LINE_TOKEN)

        let query = `${DataConstants.MUTATION} { ${DataConstants.ADD_UPDATE_TRANSACTION}
                (
                    ${DataConstants.INPUT_TRANSACTION}: {
                        ${DataConstants.TRASACTION_ID}:${transactionId},
                        ${DataConstants.SESSION_IDS}:[${fields.selectedSessionIds}],
                        ${DataConstants.SERVICE_NAME}:"${fields.serviceName}",
                        ${DataConstants.DESCRIPTION}:"${cleanDesc}",
                        ${DataConstants.REF_ID}:"${fields.refId}",
                        ${DataConstants.PAYMENT}:${fields.payment}
                    }
                )
            {
                ${DataConstants.TRASACTION_ID}
            }
        }`
        return query; //.replace(/\s/g, '');
    },
}