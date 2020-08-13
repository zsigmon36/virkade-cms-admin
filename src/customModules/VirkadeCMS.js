import React, { Component } from 'react';
import VirkadeAdminPages from './VirkadeAdminPages.js'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sharedFlagsAction from './reduxActions/SharedFlagsAction.js'
import searchFilterAction from './reduxActions/SearchFilterAction.js'
import Loader from './pages/fragments/Loader.js';
import CustomAlert from './pages/fragments/CustomAlert.js';
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js';

class VirkadeCMS extends Component {

  constructor(props) {
    super(props)
    this.closeCallback = this.closeCallback.bind(this)
    this.filterOptionsCallback = this.filterOptionsCallback.bind(this)
  }

  componentDidMount() {
    this.loading(true)
    DatabaseAPI.getAllActivities(this.props.user, this.filterOptionsCallback)
    DatabaseAPI.getAllLocations(this.props.user, this.filterOptionsCallback)
  }

  filterOptionsCallback(data, error) {
    if (data && data.getAllActivities && data.getAllActivities.length > 0) {
      this.props.searchFilterAction({ activityFilterOptions: data.getAllActivities })
    } else if (data && data.getAllLocations && data.getAllLocations.length > 0) {
      this.props.searchFilterAction({ locationFilterOptions: data.getAllLocations })
    } else if (error) {
      console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message} \n\nplease sign in again`)
    } else {
      console.error(`hmmm... \nlooks like something went wrong.`)
    }
  }

  loading(data) {
    let loading = data || false;
    this.props.sharedFlagsAction({ loading: loading })
    return true
  }

  closeCallback() {
    this.props.sharedFlagsAction({ alertOpen: false });
  }
  render() {
    return (
      <div style={{ width: '100%' }}>
        <CustomAlert isOpen={this.props.sharedFlags.alertOpen} type={this.props.alert.type} msg={this.props.alert.msg} onClose={() => this.closeCallback} />
        <Loader loading={this.props.sharedFlags.loading} />
        <VirkadeAdminPages />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    sharedFlags: state.sharedFlags,
    alert: state.alert,
    user: state.user,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
    searchFilterAction: bindActionCreators(searchFilterAction, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VirkadeCMS);