import React, { Component } from 'react';
import Header from './fragments/Header.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from "moment";
import { ROUTES } from '../VirkadeAdminPages.js';
import { Link } from "react-router-dom"

class Home extends Component {

    constructor(props) {
        super(props)
        this.setPendingSessions = this.setPendingSessions.bind(this)
        this.refreshSessions = this.refreshSessions.bind(this)
    }
    
    state = {
        pendingSessions: [],
        refreshInterval: function () { }
    }

    componentDidMount() {
        this.refreshSessions()
        let refreshInterval = setInterval(this.refreshSessions, (1 * 60 * 1000))
        this.setState({ refreshInterval })
    }

    componentWillUnmount() {
        clearInterval(this.state.refreshInterval)
    }

    refreshSessions() {
        this.loading(true)
        DatabaseAPI.getPendingSessions(this.props.user, this.props.searchFilter, this.setPendingSessions)
    }

    setPendingSessions(data) {
        let pendingSessions = [];
        if (data.getPendingSessions && data.getPendingSessions.length > 0) {
            pendingSessions.push(
                <div key={0} className='table row'>
                    <div className='th' style={{ flexGrow: 0.5 }}>payed</div>
                    <div className='th'>session id</div>
                    <div className='th'>start time</div>
                    <div className='th'>end time</div>
                    <div className='th' style={{ flexGrow: 2.5 }}>customer name</div>
                    <div className='th' style={{ flexGrow: 2 }}>username</div>
                    <div className='th' style={{ flexGrow: 2 }}>location</div>
                    <div className='th' style={{ flexGrow: 2 }}>activity</div>
                </div>
            );
            (data.getPendingSessions).map((session, index) => {
                let startDate = moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                let endDate = moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
                startDate = startDate.format('hh:mm a')
                endDate = endDate.format('hh:mm a')
                let { payed, sessionId, firstName, lastName, username, userId } = session
                let locName = session.location.name;
                let locId = session.location.locationId;
                let actName = session.activity.name;
                let actId = session.activity.activityId;
                let counter = index + 1

                let curStateKey = `payedStatus${counter}`
                let curStateValue = payed ? '[X]' : '[ ]'
                this.setState({ [curStateKey]: curStateValue });
                pendingSessions.push(
                    <div key={counter} className={`table row ${index % 2 === 0 ? 'alt' : 'reg'}`}>
                        <div className='tr center' style={{ flexGrow: 0.5 }}>{this.state[curStateKey]}</div>
                        <div className='tr'><Link to={{
                            pathname: ROUTES.SESSION_PAGE,
                            search: `?id=${sessionId}`
                        }}>{sessionId}</Link></div>
                        <div className='tr'>{startDate}</div>
                        <div className='tr'>{endDate}</div>
                        <div className='tr' style={{ flexGrow: 2.5 }}><Link to={{
                            pathname: ROUTES.USER_PAGE,
                            search: `?id=${userId}`
                        }}>{`${lastName}, ${firstName}`}</Link></div>
                        <div className='tr' style={{ flexGrow: 2 }}><Link to={{
                            pathname: ROUTES.USER_PAGE,
                            search: `?id=${userId}`
                        }}>{username}</Link></div>
                        <div className='tr' style={{ flexGrow: 2 }}><Link to={{
                            pathname: ROUTES.LOCATION_PAGE,
                            search: `?id=${locId}`
                        }}>{locName}</Link></div>
                        <div className='tr' style={{ flexGrow: 2 }}><Link to={{
                            pathname: ROUTES.ACTIVITY_PAGE,
                            search: `?id=${actId}`
                        }}>{actName}</Link></div>
                    </div>
                )
                return true;
            });
        } else {
            pendingSessions.push(
                <div key={0} className='table row'>
                    <div className='th center'>:no pending sessions:</div>
                </div>
            );
        }
        this.setState({ 'pendingSessions': pendingSessions })
        this.loading(false)
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    render() {
        return (
            <div className='wrapper'>
                <Header history={this.props.history} />
                <div className='row section'>
                    <h2>::pending sessions::</h2>
                </div>
                <div className='section border'>
                    {this.state.pendingSessions}
                </div>
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
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

