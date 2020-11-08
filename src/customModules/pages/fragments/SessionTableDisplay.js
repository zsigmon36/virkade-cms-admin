import React, { Component } from 'react';
import userAction from '../../reduxActions/UserAction'
import { ROUTES } from '../../VirkadeAdminPages.js';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from "react-router-dom"
import moment from "moment";

class SessionTableDisplay extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
    }

    componentDidMount() {
        this.props.sessions.forEach((element) => {
            let curStateKey = `payedStatus${element.sessionId}`
            this.setState({ [curStateKey]: element.payed });
        });
        this.setState({ loading: false })
    }

    updateInput(event) {
        let key = event.target.name
        let value = event.target.value
        if (value === '[ ]') {
            value = true;
        } else if (value === '[X]') {
            value = false;
        }
        this.setState({ [key]: value })
    }

    render() {

        return (
            <div className='border' style={{ display: 'block', width: '100%', padding: '0 10px 0 10px', margin: '0 10px 5px 10px', boxSizing: 'border-box' }}>
                <h2>::sessions::</h2>
                <div className='separator'></div>
                <div key={0} className='table row'>
                    <div className='th' style={{ flexGrow: 0.5 }}>payed</div>
                    <div className='th' style={{ flexGrow: 0.5 }}>id</div>
                    <div className='th' style={{ flexGrow: 1.5 }}>start time</div>
                    <div className='th' style={{ flexGrow: 1.5 }}>end time</div>
                    <div className='th'>location</div>
                    <div className='th'>activity</div>
                </div>
                {this.props.sessions.map((session, index) => (
                    <div key={session.sessionId} className={`table row ${index % 2 === 0 ? 'alt' : 'reg'}`}>
                        <div className='tr' style={{ flexGrow: 0.5 }}>
                            <input autoComplete='off' style={{ width: 50 }} className={`checkBox ${index % 2 === 0 ? 'alt' : 'reg'}`} type="text" id={`payed-status-${session.sessionId}`} name={`payedStatus${session.sessionId}`} value={this.state[`payedStatus${session.sessionId}`] ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                        </div>
                        <div className='tr' style={{ flexGrow: 0.5 }}><Link to={{
                            pathname: ROUTES.SESSION_PAGE,
                            search: `?id=${session.sessionId}`
                        }}>{session.sessionId}</Link></div>
                        <div className='tr' style={{ flexGrow: 1.5 }} >{moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S').format('LLL')}</div>
                        <div className='tr' style={{ flexGrow: 1.5 }} >{moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S').format('LLL')}</div>
                        <div className='tr'><Link to={{
                            pathname: ROUTES.LOCATION_PAGE,
                            search: `?id=${session.location.locationId}`
                        }}>{session.location.name}</Link></div>
                        <div className='tr'><Link to={{
                            pathname: ROUTES.ACTIVITY_PAGE,
                            search: `?id=${session.activity.activityId}`
                        }}>{session.activity.name}</Link></div>
                    </div>
                ))}
                {(!this.props.sessions || this.props.sessions.length === 0) &&
                    <div key={0} className='table row'>
                        <div className='th center'>:no sessions:</div>
                    </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        sessions: ownProps.sessions
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(userAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionTableDisplay);