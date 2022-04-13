export default function userAction(user){
    if (user.fullUser){
        return {type: 'SET_FULL_USER', user}
    } 
    if (user.resetDefaults){
        return {type: 'RESET_USER', user}
    } 
    return {type: 'UPDATE_USER', user}
}