const defaultState = {
    showLogin: false,
    loading: true,
    alertOpen: false
}

export default function sharedFlagsReducer(state = defaultState, action) {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case 'UPDATE_FLAG':
            newState[Object.keys(action.flag)[0]] = action.flag[Object.keys(action.flag)[0]];
            return newState;
        default:
            return state;
    }
}
