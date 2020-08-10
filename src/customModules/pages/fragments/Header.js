import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ROUTES } from '../../VirkadeAdminPages';
import Login from './Login';
import { DatabaseAPI } from '../../dataAccess/DatabaseAPI.js';
import { bindActionCreators } from 'redux';
import { defaultState } from '../../../static/reduxDefault'
import userAction from '../../reduxActions/UserAction';
import sharedFlagsAction from '../../reduxActions/SharedFlagsAction.js'
import alertAction from '../../reduxActions/AlertAction.js';

const ADMIN_TYPE_CODE = 'ADMN'

class Header extends Component {

  constructor(props) {
    super(props)
    this.permissionCheck = this.permissionCheck.bind(this)
    this.signOutCallBack = this.signOutCallBack.bind(this)
    let location = this.props.history.location;
    if (this.props.user.authToken && this.props.user.authToken.token !== "") {
      DatabaseAPI.checkSession(this.props.user.authToken, this.permissionCheck)
    } else if ((!this.props.user.authToken || this.props.user.authToken.token === "") && (location.pathname !== ROUTES.HOME_PAGE && location.pathname !== ROUTES.FORGOTPASS_PAGE)) {
      this.props.history.push(ROUTES.HOME_PAGE);
    }
  }

  state = {
    payedFilter: false,
  }

  loading(data) {
    let loading = data || false;
    this.props.sharedFlagsAction({ loading: loading })
    return true
  }

  updateInput(event) {
    let key = event.target.name
    let value = event.target.value
    this.props.userAction({ [key]: value })
  }

  permissionCheck(data) {
    let location = this.props.history.location;
    let isValid = data || data.checkSession || false;
    if (isValid && this.props.user.userTypeCode !== ADMIN_TYPE_CODE && (location.pathname !== ROUTES.HOME_PAGE )) {
      this.props.alertAction({ type: 'error' })
      this.props.alertAction({ msg: `only admin users are allowed access past the home page` })
      this.props.sharedFlagsAction({ alertOpen: true });
      this.props.history.push(ROUTES.HOME_PAGE);
      isValid = false;
    } else if (!isValid) {
      let target = {
        name: "authToken", value: {
          'token': '',
          'createdDate': '',
          'username': ''
        }
      }
      this.updateInput({ target })
      this.props.history.push(ROUTES.HOME_PAGE);
    }
    this.loading(false)
    return isValid;
  }

  logout() {
    this.loading(true)
    if (this.props.user.authToken && this.props.user.authToken.token !== "") {
      DatabaseAPI.signOut(this.props.user.authToken, this.signOutCallBack)
    } else {
      //already signed out
      let data = {
        signOut: true
      }
      this.signOutCallBack(data)
    }
  }


  signOutCallBack(data, error) {
    if (data && data.signOut) {
      this.props.userAction({ resetDefaults: defaultState })
      this.props.history.push(ROUTES.HOME_PAGE);
    } else if (error) {
      this.props.alertAction({ type: 'error' })
      this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.  \n${error[0].message} \n\nplease sign in again` })
      this.props.sharedFlagsAction({ alertOpen: true });
      this.props.userAction({ resetDefaults: defaultState })
      this.props.history.push(ROUTES.HOME_PAGE);
    } else {
      this.props.alertAction({ type: 'error' })
      this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.` })
      this.props.sharedFlagsAction({ alertOpen: true });
    }
    this.loading(false)
  }

  controlButtons() {
    let buttonHtml = [];
    let pathname = this.props.history.location.pathname || '/';
    let isLoggedIn = this.props.user.authToken.token.length > 0
    //common filters
    if (pathname === ROUTES.HOME_PAGE) {
      buttonHtml.push(
        <div key="0" className='col filters'>
          <div className='col'>
            <p className='label'>filters::</p>
          </div>
          <div className='col'>
            <button onClick={() => alert("click test")} className={this.state.payedFilter ? 'filter-active' : 'filter-inactive'} >
              not payed
            </button>
          </div>
          <div className='col'>
            <select id='activity-filter' name='activity-filter' onChange={() => alert("click test")} >
              <option>activity</option>
            </select>
          </div>
          <div className='col'>
            <select id='location-filter' name='location-filter' onChange={() => alert("click test")} >
              <option>location</option>
            </select>
          </div>

        </div>
      )
    }

    buttonHtml.push(
      <div key="1" className='col row-filler'>
      </div>
    )

    if (pathname === ROUTES.USER_PAGE) {
      buttonHtml.push(
        <div key="2" className='col'>
          <button onClick={() => alert("click test")} >
            add note
          </button>
        </div>
      )
      buttonHtml.push(
        <div key="3" className='col'>
          <button onClick={() => alert("click test")} >
            add session
          </button>
        </div>
      )
      buttonHtml.push(
        <div key="4" className='col'>
          <button onClick={() => alert("click test")} >
            update user
          </button>
        </div>
      )
    }

    if (pathname !== ROUTES.HOME_PAGE) {
      buttonHtml.push(
        <div key="5" className='col'>
          <button onClick={() => this.props.history.push(ROUTES.HOME_PAGE)} >
            home
          </button>
        </div>
      )
    }

    if (pathname === ROUTES.HOME_PAGE && isLoggedIn) {
      buttonHtml.push(
        <div key="6" className='col'>
          <button onClick={() => this.props.history.push(ROUTES.SEARCH_PAGE)} >
            user search
          </button>
        </div>
      )
    }

    //login is always last
    buttonHtml.push(
      <div key="7" className='col'>
        <button onClick={() => isLoggedIn ? this.logout() :
          this.props.sharedFlagsAction({ showLogin: true })}>
          {isLoggedIn ? 'sign out' : 'sign in'}
        </button>
      </div>
    )
    return buttonHtml;
  }

  render() {
    return (
      <div>
        {this.props.sharedFlags.showLogin &&
          <Login history={this.props.history} />
        }
        <div className='header'>
          <div className='col logo'>
          </div>
          <div className='col spacer'>
          </div>
          {
            this.controlButtons()
          }
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    sharedFlags: state.sharedFlags
  }
}

function mapDispatchToProps(dispatch) {
  return {
    userAction: bindActionCreators(userAction, dispatch),
    sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
    alertAction: bindActionCreators(alertAction, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);