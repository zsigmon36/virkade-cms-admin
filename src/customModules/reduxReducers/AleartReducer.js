const defaultState = {
    type: 'info',
    msg: '',
}

export default function alertReducer(state = defaultState, action) {
    let newState = Object.assign({}, state);
    switch (action.type) {
        case 'UPDATE_ALERT':
            newState[Object.keys(action.flag)[0]] = action.flag[Object.keys(action.flag)[0]];
            return newState;
        default:
            return state;
    }
}
