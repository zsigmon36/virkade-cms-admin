
const defaultState = {
    activityFilterOptions: [],
    locationFilterOptions: [],
    selActivityFilter: '',
    selLocationFilter: '',
    selPayedFilter: '',
    selDateFilter: '',
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
        case 'CLEAR_SEARCH_FILTER':
            let clearState = Object.assign({}, defaultState);
            clearState.activityFilterOptions = newState.activityFilterOptions;
            clearState.locationFilterOptions = newState.locationFilterOptions;
            return clearState;
        default:
            return state;
    }
}
