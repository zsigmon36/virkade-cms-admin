import React, { Component } from 'react';
import Header from './fragments/Header.js'
import userAction from '../reduxActions/UserAction.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ROUTES } from '../VirkadeAdminPages.js';
import { Link } from "react-router-dom"
import TabNav from './fragments/TabNav.js';
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js';
import searchFilterAction from '../reduxActions/SearchFilterAction';
import validator from 'validator';
import alertAction from '../reduxActions/AlertAction.js';

class Search extends Component {

    constructor(props) {
        super(props)
        this.setUserRows = this.setUserRows.bind(this)
        this.setPickerSates = this.setPickerSates.bind(this);
        this.updateFilterInput = this.updateFilterInput.bind(this)
        this.state = {
            searchedUsers: [],
        }

    }

    componentDidMount() {
        this.loading(true)
        DatabaseAPI.getAllStates(this.props.user, this.setPickerSates)
        DatabaseAPI.searchUsers(this.props.user, this.props.searchFilter, this.setUserRows)

    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    updateFilterInput(event) {
        let key = event.target.name
        let value = event.target.value
        this.props.searchFilterAction({ [key]: value })
        this.validateInput({ [key]: value }, false)
    }

    validateInput(data, isAlert = true) {
        let { fnameFilter, lnameFilter, emailFilter, usernameFilter, zipFilter } = data;
        let msg = '';
        let valid = true

        if (zipFilter !== undefined && zipFilter !== '' && !validator.isPostalCode(zipFilter, "US")) {
            msg = 'postal code needs to be blank or a valid US postal code'
            valid = false;
        } else if (fnameFilter !== undefined && fnameFilter !== "" &&  fnameFilter.length < 2) {
            msg = 'first name search needs to be blank or at least 2 characters'
            valid = false;
        } else if (lnameFilter !== undefined && lnameFilter !== "" && lnameFilter.length < 2) {
            msg = 'last name search needs to be blank or at least 2 characters'
            valid = false;
        } else if (emailFilter !== undefined && emailFilter !== "" && emailFilter.length < 3) {
            msg = 'email search needs to be blank or at least 3 characters'
            valid = false;
        } else if (usernameFilter !== undefined && (usernameFilter !== "" && usernameFilter.length < 3)) {
            msg = 'username search needs to be blank or at least 3 characters'
            valid = false;
        }
        this.setState({ validatorMsg: msg })

        if (isAlert && !valid) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: msg })
            this.props.sharedFlagsAction({ alertOpen: true });

        }
        return valid;

    }

    tabData = [
        { active: true, title: ':user search:', pathname: ROUTES.SEARCH_PAGE },
        { active: false, title: ':location:', pathname: ROUTES.LOCATION_PAGE },
        { active: false, title: ':activity:', pathname: ROUTES.ACTIVITY_PAGE },
    ]

    setPickerSates(data) {
        let pickerItems = [];
        if (data.getAllStates) {
            (data.getAllStates).map(item => {
                pickerItems.push(<option key={item.name} value={item.stateId}>{item.name}</option>)
                return true
            })
        }
        this.setState({ 'pickerStates': pickerItems })
    }

    search() {
        if (this.validateInput(this.props.searchFilter, true)) {
            this.loading(true)
            DatabaseAPI.searchUsers(this.props.user, this.props.searchFilter, this.setUserRows)
        }
    }

    setUserRows(data, error) {
        let searchedUsers = [];
        if (data.searchUsers && data.searchUsers.length > 0) {
            searchedUsers.push(
                <div key={0} className='table row'>
                    <div className='th' style={{ flexGrow: 0.5 }}>userid</div>
                    <div className='th'>first name</div>
                    <div className='th'>last name</div>
                    <div className='th' style={{ flexGrow: 2 }}>username</div>
                    <div className='th' style={{ flexGrow: 2 }}>email address</div>
                    <div className='th' style={{ flexGrow: 3 }}>address</div>
                    <div className='th'>type</div>
                    <div className='th' style={{ flexGrow: 0.5 }}>status</div>
                </div>
            );
            (data.searchUsers).map((user, index) => {
                let { userId, firstName, lastName, emailAddress, username } = user
                let fullAddress = user.address ? ` ${user.address.street}` : ''
                fullAddress += user.address ? ` ${user.address.apt}` : ''
                fullAddress += user.address ? ` ${user.address.unit}` : ''
                fullAddress += user.address ? ` ${user.address.city},` : ''
                fullAddress += user.address ? ` ${user.address.state.stateCode}` : ''
                fullAddress += user.address ? ` ${user.address.postalCode}` : ''
                fullAddress = fullAddress || 'n/a'

                let typeName = user.type ? user.type.name : 'n/a'
                let statusName = user.status ? user.status.name : 'n/a'

                let counter = index + 1

                searchedUsers.push(
                    <div key={counter} className={`table row ${index % 2 === 0 ? 'alt' : 'reg'}`}>
                        <div className='tr' style={{ flexGrow: 0.5 }}><Link to={{
                            pathname: ROUTES.USER_PAGE,
                            search: `?id=${userId}`
                        }}>{userId}</Link></div>

                        <div className='tr'>{firstName}</div>
                        <div className='tr'>{lastName}</div>

                        <div className='tr' style={{ flexGrow: 2 }}><Link to={{
                            pathname: ROUTES.USER_PAGE,
                            search: `?id=${userId}`
                        }}>{username}</Link></div>

                        <div className='tr' style={{ flexGrow: 2 }}><Link to={{
                            pathname: ROUTES.USER_PAGE,
                            search: `?id=${userId}`
                        }}>{emailAddress}</Link></div>

                        <div className='tr' style={{ flexGrow: 3 }}>{fullAddress}</div>
                        <div className='tr'>{typeName}</div>
                        <div className='tr' style={{ flexGrow: 0.5 }}>{statusName}</div>
                    </div>
                )
                return true;
            });
        } else {
            searchedUsers.push(
                <div key={0} className='table row'>
                    <div className='th center'>:no users found:</div>
                </div>
            );
        }
        this.setState({ 'searchedUsers': searchedUsers })
        this.loading(false)
    }

    render() {
        return (
            <div className='wrapper'>
                <Header history={this.props.history} />
                <TabNav tabData={this.tabData} />
                <div className='section border alt' style={{ padding: 20 }}>
                    <div key="0" className='row'>
                        <h3 className='col even-space' style={{textAlign: 'center'}}>
                            {this.state.validatorMsg}
                        </h3>
                    </div>
                    <div key="1" className='row'>
                        <div className='col even-space'>
                            <label htmlFor="fname">first name:</label>
                            <input className='alt' type="text" id="fname" name="fnameFilter" value={this.props.searchFilter.fnameFilter} onChange={this.updateFilterInput} />
                        </div>
                        <div className='col even-space'>
                            <label htmlFor="lname">last name:</label>
                            <input className='alt' type="text" id="lname" name="lnameFilter" value={this.props.searchFilter.lnameFilter} onChange={this.updateFilterInput} />
                        </div>
                        <div className='col even-space'>
                            <label htmlFor="email">email address:</label>
                            <input className='alt' type="text" id="email" name="emailFilter" value={this.props.searchFilter.emailFilter} onChange={this.updateFilterInput} />
                        </div>
                        <div className='col even-space'>
                            <label htmlFor="username">username:</label>
                            <input className='alt' type="text" id="username" name="usernameFilter" value={this.props.searchFilter.usernameFilter} onChange={this.updateFilterInput} />
                        </div>
                    </div>
                    <div key="2" className='row'>
                        <h4>address:</h4>
                        <div className="border col even-space" style={{ padding: 10, margin: 20 }} >
                            <div className='col even-space'>
                                <label htmlFor="street">street:</label>
                                <input className='alt' type="text" id="street" name="streetFilter" value={this.props.searchFilter.streetFilter} onChange={this.updateFilterInput} />
                            </div>
                            <div className='col even-space'>
                                <label htmlFor="city">city:</label>
                                <input className='alt' type="text" id="city" name="cityFilter" value={this.props.searchFilter.cityFilter} onChange={this.updateFilterInput} />
                            </div>
                            <div className='col even-space'>
                                <select className='alt' id='state-filter' name='selStateFilter' value={this.props.searchFilter.selStateFilter} onChange={this.updateFilterInput} >
                                    <option key='0' value={0}>state</option>
                                    {this.state.pickerStates}
                                </select>
                            </div>
                            <div className='col even-space'>
                                <label htmlFor="zip">zip:</label>
                                <input className='alt' type="text" id="zip" name="zipFilter" value={this.props.searchFilter.zipFilter} onChange={this.updateFilterInput} />
                            </div>
                        </div>
                        <div className='col'>
                            <button onClick={() => this.search()} >
                                search
                            </button>
                        </div>
                    </div>
                </div>
                <div className='section border'>
                    {this.state.searchedUsers}
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
        userAction: bindActionCreators(userAction, dispatch),
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
        alertAction: bindActionCreators(alertAction, dispatch),
        searchFilterAction: bindActionCreators(searchFilterAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);

