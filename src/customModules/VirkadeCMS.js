import React, { Component } from 'react';
import VirkadeAdminPages from './VirkadeAdminPages.js'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sharedFlagsAction from './reduxActions/SharedFlagsAction.js'
import Loader from './pages/fragments/Loader.js';
import CustomAlert from './pages/fragments/CustomAlert.js';

class VirkadeCMS extends Component {

  constructor(props) {
    super(props)
    this.closeCallback = this.closeCallback.bind(this)
  }

  componentDidMount() {
    this.loading(false)
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
      <div style={{width:'100%'}}>
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
    alert: state.alert
  }
}

function mapDispatchToProps(dispatch) {
  return {
    sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VirkadeCMS);