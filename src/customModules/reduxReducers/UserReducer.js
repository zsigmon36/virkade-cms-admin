import { defaultState } from '../../static/reduxDefault'

export default function userReducer(state = defaultState, action) {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case 'UPDATE_USER':
            newState[Object.keys(action.user)[0]] = action.user[Object.keys(action.user)[0]];
            return newState;
        case 'SET_FULL_USER':
            newState = covertUserData(action.user, newState);
            return newState;
        case 'RESET_USER':
            newState = defaultState;
            return newState;
        default:
            return state;
    }
}

function covertUserData(data, state) {
    let convertedUser = state;
    let rawUser = data.fullUser
    for (let [key, value] of Object.entries(rawUser)) {
        if (rawUser[key] && key == 'address') {
            let address = value
            convertedUser.street = address.street
            convertedUser.apt = address.apt
            convertedUser.unit = address.unit
            convertedUser.city = address.city
            convertedUser.state = address.state.stateCode
            convertedUser.postalCode = address.postalCode
            convertedUser.addressTypeCode = address.type.code
        } else if (rawUser[key] && key == 'height') {
            let heightFt = Math.floor(value / 12)
            let heightIn = value % 12
            convertedUser.heightFt = String(heightFt)
            convertedUser.heightIn = String(heightIn)
        } else if (rawUser[key] && key == 'phoneNumbers') {
            let phones = value
            convertedUser.phoneCountryCode = phones.length > 0 ? phones[0].countryCode : '0'
            convertedUser.phoneNumber = phones.length > 0 ? phones[0].number : ""
            convertedUser.phoneType = phones.length > 0 ? phones[0].type.code : "MBLE_PHNE"
        } else if (rawUser[key] && key == 'status') {
            convertedUser.statusId = value.statusId
        } else if (rawUser[key] && key == 'type') {
            convertedUser.userTypeCode = value.code
        } else {
            convertedUser[key] = rawUser[key]
        }
    }

    return convertedUser
}