export default function searchFilterAction(filter){
    if (filter.resetDefaults){
        return {type: 'CLEAR_SEARCH_FILTER', filter}
    } else {
        return {type: 'UPDATE_SEARCH_FILTER', filter}
    }
}