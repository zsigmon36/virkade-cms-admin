import React, { Component } from 'react';
import Header from './fragments/Header.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import searchFilterAction from '../reduxActions/SearchFilterAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ROUTES } from '../VirkadeAdminPages.js';
import TabNav from './fragments/TabNav.js';
import validator from 'validator';
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js';
import alertAction from '../reduxActions/AlertAction.js';

const defaultLocalState = {
    locationSelState: "0",
    pickerStates: [],
    selLocationFilter: 0,
    locationApt: "",
    locationCity: "",
    locationDescription: "",
    locationPhoneNum: "",
    locationManager: "",
    locationName: "",
    locationStreet: "",
    locationTaxRate: "",
    locationUnit: "",
    locationZip: "",
}

class Location extends Component {

    constructor(props) {
        super(props)
        this.setPickerSates = this.setPickerSates.bind(this);
        this.updateInput = this.updateInput.bind(this);
        this.setLocationDetails = this.setLocationDetails.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
        this.filterOptionsCallback = this.filterOptionsCallback.bind(this);
        this.state = Object.assign({}, defaultLocalState);
    }

    componentDidMount() {
        this.loading(true)
        DatabaseAPI.getAllStates(this.props.user, this.setPickerSates)
        if (this.props.location && this.props.location.search) {
            let search = this.props.location.search;
            let urlParams = new URLSearchParams(search);
            let id = urlParams.get('id');

            let event = {
                target: {
                    name: 'selLocationFilter',
                    value: parseInt(id)
                }
            }
            this.updateInput(event)
        }
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    validateInput(data, isAlert = true) {
        let { locationDescription, locationPhoneNum, locationManager, locationTaxRate, locationZip, locationName, locationCity, locationStreet, locationSelState } = data;
        let msg = '';
        let valid = true

        if (locationZip !== undefined && (locationZip === '' || !validator.isPostalCode(locationZip, "US"))) {
            msg = 'postal code needs to be a valid US postal code'
            valid = false;
        } else if (locationName !== undefined && (locationName === "" || locationName.length < 6)) {
            msg = 'name cannot be empty and must be at least 6 characters'
            valid = false;
        } else if (locationDescription !== undefined && (locationDescription === "" || locationDescription.length < 15)) {
            msg = 'description cannot be empty and must be at least 15 characters'
            valid = false;
        } else if (locationCity !== undefined && locationCity === "") {
            msg = 'city cannot be empty'
            valid = false;
        } else if (locationStreet !== undefined && locationStreet === "") {
            msg = 'street cannot be empty'
            valid = false;
        } else if (locationPhoneNum !== undefined && (locationPhoneNum === "" || !validator.isMobilePhone(locationPhoneNum.toString(), "en-US"))) {
            msg = 'phone number needs to be a valid mobile phone number'
            valid = false;
        } else if (locationManager !== undefined && locationManager === "") {
            msg = 'manager cannot be empty'
            valid = false;
        } else if (locationTaxRate !== undefined && (locationTaxRate === "" || !validator.isNumeric(locationTaxRate.toString()))) {
            msg = 'tax rate cannot be empty and must be a number or decimal'
            valid = false;
        } else if (locationSelState !== undefined && locationSelState === "0") {
            msg = 'must select a state'
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
        { active: false, title: ':user search:', pathname: ROUTES.SEARCH_PAGE },
        { active: true, title: ':location:', pathname: ROUTES.LOCATION_PAGE },
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
        this.loading(false)
    }

    updateInput(event) {
        let key = event.target.name
        let value = event.target.value
        this.setState({ [key]: value })
        this.validateInput({ [key]: value }, false)
        if (key === 'selLocationFilter') {
            DatabaseAPI.getLocation(this.props.user, value, this.setLocationDetails)
        }
    }

    setLocationDetails(data, error) {
        let newState = Object.assign({}, this.state);
        let location = data.getLocation
        if (location) {
            newState.locationDescription = location.description
            newState.locationPhoneNum = location.phoneNum
            newState.locationManager = location.manager
            newState.locationName = location.name
            newState.locationTaxRate = location.taxRate
            newState.locationApt = location.address.apt || ''
            newState.locationCity = location.address.city
            newState.locationStreet = location.address.street
            newState.locationUnit = location.address.unit || ''
            newState.locationZip = location.address.postalCode
            newState.locationSelState = location.address.state.stateId
        } else {
            newState = Object.assign({}, defaultLocalState);
            newState.pickerStates = this.state.pickerStates
        }
        this.setState(newState);
    }
    addLocation() {
        if (this.validateInput(this.state)) {
            this.loading(true)
            let curState = Object.assign({}, this.state);
            curState.selLocationFilter = 0;
            DatabaseAPI.addUpdateLocation(this.props.user, curState, this.confirmationAlert)
        }
    }

    updateLocation() {
        if (this.validateInput(this.state) && this.state.selLocationFilter && this.state.selLocationFilter > 0) {
            this.loading(true)
            DatabaseAPI.addUpdateLocation(this.props.user, this.state, this.confirmationAlert)
        } else if (!this.state.selLocationFilter || this.state.selLocationFilter === 0) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: 'update requires a selected location' })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
    }

    confirmationAlert(data, error) {
        if (data && (data.addUpdateLocation)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: "location saved successfully" })
            this.props.sharedFlagsAction({ alertOpen: true });
            DatabaseAPI.getAllLocations(this.props.user, this.filterOptionsCallback)
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong. \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.loading(false)
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.loading(false)
        }
    }

    filterOptionsCallback(data, error) {
        if (data && data.getAllLocations && data.getAllLocations.length > 0) {
            this.props.searchFilterAction({ locationFilterOptions: data.getAllLocations })
        } else if (error) {
            console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            console.error(`hmmm... \nlooks like something went wrong.`)
        }
        this.loading(false)
    }

    render() {
        return (
            <div className='wrapper'>
                <Header history={this.props.history} />
                <TabNav tabData={this.tabData} />
                <div className='section'>
                    < div className='row'>
                        <div className='col even-space border' style={{ padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::location details::</h2>
                            <div className='separator'></div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <select id='location-filter' style={{ width: '100%' }} name='selLocationFilter' value={this.state.selLocationFilter} onChange={this.updateInput} >
                                    <option key='0' value={0}>location</option>
                                    {
                                        this.props.searchFilter.locationFilterOptions.map(item => {
                                            return <option key={item.locationId} value={item.locationId}>{item.name}</option>
                                        })
                                    }
                                </select>
                            </div>

                            <div className='separator'></div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationName">name:</label>
                                    <input autoComplete='off' type="text" id="location-name" name="locationName" value={this.state.locationName} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationTaxRate">tax rate:</label>
                                    <input autoComplete='off' type="text" id="location-taxRate" name="locationTaxRate" value={this.state.locationTaxRate} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationDescription">description:</label>
                                    <input autoComplete='off' type="text" id="location-description" name="locationDescription" value={this.state.locationDescription} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationPhoneNum">phone number:</label>
                                    <input autoComplete='off' type="text" id="location-phoneNum" name="locationPhoneNum" value={this.state.locationPhoneNum} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationManager">manager:</label>
                                    <input autoComplete='off' type="text" id="location-manager" name="locationManager" value={this.state.locationManager} onChange={this.updateInput} />
                                </div>
                            </div>

                            <h4>:address details:</h4>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationStreet">street:</label>
                                    <input autoComplete='off' type="text" id="location-street" name="locationStreet" value={this.state.locationStreet} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationUnit">unit:</label>
                                    <input autoComplete='off' type="text" id="location-unit" name="locationUnit" value={this.state.locationUnit} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationApt">apt:</label>
                                    <input autoComplete='off' type="text" id="location-apt" name="locationApt" value={this.state.locationApt} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationCity">city:</label>
                                    <input autoComplete='off' type="text" id="location-city" name="locationCity" value={this.state.locationCity} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>

                                <select id='location-state' name='locationSelState' style={{ width: '100%' }} value={this.state.locationSelState} onChange={this.updateInput} >
                                    <option key='0' value={0}>state</option>
                                    {this.state.pickerStates}
                                </select>

                            </div>
                            <div className='col even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationZip">zip:</label>
                                    <input autoComplete='off' type="text" id="location-zip" name="locationZip" value={this.state.locationZip} onChange={this.updateInput} />
                                </div>
                            </div>

                            <div className='col even-space' style={{ width: '65%' }}>
                                <button style={{ width: '100%', margin: '50px 0', borderWidth: 2 }} onClick={() => this.updateLocation()} >
                                    update location
                                </button>
                            </div>
                        </div>

                        <div className='col even-space border' style={{ padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::new location::</h2>
                            <div className='separator'></div>

                            <h3 className='col even-space' style={{ textAlign: 'center' }}>
                                {this.state.validatorMsg}
                            </h3>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationName">name:</label>
                                    <input autoComplete='off' type="text" id="location-name" name="locationName" value={this.state.locationName} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationTaxRate">tax rate:</label>
                                    <input autoComplete='off' type="text" id="location-taxRate" name="locationTaxRate" value={this.state.locationTaxRate} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationDescription">description:</label>
                                    <input autoComplete='off' type="text" id="location-description" name="locationDescription" value={this.state.locationDescription} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationPhoneNum">phone number:</label>
                                    <input autoComplete='off' type="text" id="location-phoneNum" name="locationPhoneNum" value={this.state.locationPhoneNum} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationManager">manager:</label>
                                    <input autoComplete='off' type="text" id="location-manager" name="locationManager" value={this.state.locationManager} onChange={this.updateInput} />
                                </div>
                            </div>

                            <h4>:address details:</h4>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationStreet">street:</label>
                                    <input autoComplete='off' type="text" id="location-street" name="locationStreet" value={this.state.locationStreet} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationUnit">unit:</label>
                                    <input autoComplete='off' type="text" id="location-unit" name="locationUnit" value={this.state.locationUnit} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationApt">apt:</label>
                                    <input autoComplete='off' type="text" id="location-apt" name="locationApt" value={this.state.locationApt} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationCity">city:</label>
                                    <input autoComplete='off' type="text" id="location-city" name="locationCity" value={this.state.locationCity} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>

                                <select id='location-state' name='locationSelState' style={{ width: '100%' }} value={this.state.locationSelState} onChange={this.updateInput} >
                                    <option key='0' value={0}>state</option>
                                    {this.state.pickerStates}
                                </select>

                            </div>
                            <div className='col even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="locationZip">zip:</label>
                                    <input autoComplete='off' type="text" id="location-zip" name="locationZip" value={this.state.locationZip} onChange={this.updateInput} />
                                </div>
                            </div>

                            <div className='col even-space' style={{ width: '65%' }}>
                                <button style={{ width: '100%', margin: '50px 0', borderWidth: 2 }} onClick={() => this.addLocation()} >
                                    add location
                                </button>
                            </div>
                        </div>
                    </div>
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
        alertAction: bindActionCreators(alertAction, dispatch),
        searchFilterAction: bindActionCreators(searchFilterAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Location);

