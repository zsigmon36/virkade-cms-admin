import React, { Component } from 'react';
import Header from './fragments/Header.js'
import userAction from '../reduxActions/UserAction.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ROUTES } from '../VirkadeAdminPages.js';
import TabNav from './fragments/TabNav.js';

class Search extends Component {

    constructor(props) {
        super(props)
        this.loading(false)
    }

    state = {
    }

    componentDidMount() {
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    tabData = [
        { active: true, title: ':user search:', pathname: ROUTES.SEARCH_PAGE },
        { active: false, title: ':location:', pathname: ROUTES.LOCATION_PAGE },
        { active: false, title: ':activity:', pathname: ROUTES.ACTIVITY_PAGE },
    ]

    render() {
        return (
            <div className='wrapper'>
                <Header history={this.props.history} />
                <TabNav tabData={this.tabData} />
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        searchFilter: state.searchFilter,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userAction: bindActionCreators(userAction, dispatch),
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);

