
const defaultState = {
    activityFilterOptions: [],
    locationFilterOptions: [],
    selActivityFilter: '',
    selLocationFilter: '',
    selPayedFilter: '',

    selStateFilter: '',
    fnameFilter: "",
    lnameFilter: "",
    emailFilter: "",
    usernameFilter: "",
    streetFilter: "",
    cityFilter: "",
    zipFilter: "",
    
}

export default function searchFilterReducer(state = defaultState, action) {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case 'UPDATE_SEARCH_FILTER':
            newState[Object.keys(action.filter)[0]] = action.filter[Object.keys(action.filter)[0]];
            return newState;
        default:
            return state;
    }
}
