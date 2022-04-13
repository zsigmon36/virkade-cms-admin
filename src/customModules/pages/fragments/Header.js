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
import searchFilterAction from '../../reduxActions/SearchFilterAction';

const ADMIN_TYPE_CODE = 'ADMN'
const NOT_PAYED = 'not payed'

class Header extends Component {

  constructor(props) {
    super(props)
    this.permissionCheck = this.permissionCheck.bind(this)
    this.signOutCallBack = this.signOutCallBack.bind(this)
    this.updateFilterInput = this.updateFilterInput.bind(this)
    this.validateSession = this.validateSession.bind(this)
  }

  componentDidMount() {
    let location = this.props.history.location;
    if (this.props.user.authToken && this.props.user.authToken.token !== "") {
      let sessionCheck = setInterval(this.validateSession, (1 * 60 * 1000))
      this.setState({ sessionCheck })
    } else if ((!this.props.user.authToken || this.props.user.authToken.token === "") && (location.pathname !== ROUTES.HOME_PAGE && location.pathname !== ROUTES.FORGOTPASS_PAGE)) {
      this.props.history.push(ROUTES.HOME_PAGE);
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.sessionCheck)
  }

  state = {
    payedFilter: false,
    sessionCheck: function () { }
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
    this.props.history.push({ pathname: ROUTES.BASE_PAGE })
    this.props.history.goBack();
  }
  validateSession(){
    DatabaseAPI.checkSession(this.props.user.authToken, this.permissionCheck)
  }

  permissionCheck(data) {
    let location = this.props.history.location;
    let isValid = data || data.checkSession || false;
    if (isValid && this.props.user.userTypeCode !== ADMIN_TYPE_CODE && (location.pathname !== ROUTES.HOME_PAGE)) {
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
      this.props.userAction({ target })
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

  toggleNotPayed() {
    if (this.props.searchFilter.selPayedFilter === NOT_PAYED) {
      this.props.searchFilterAction({ selPayedFilter: '' })
    } else {
      this.props.searchFilterAction({ selPayedFilter: NOT_PAYED })
    }
    this.props.history.push({ pathname: ROUTES.BASE_PAGE })
    this.props.history.goBack();
  }

  controlButtons() {
    let buttonHtml = [];
    let pathname = this.props.history.location.pathname || '/';
    let isLoggedIn = this.props.user.authToken.token.length > 0
    //common filters
    if (pathname === ROUTES.HOME_PAGE || pathname === ROUTES.USER_PAGE) {
      buttonHtml.push(
        <div key="0" className='col filters'>
          <div className='col'>
            <p className='label'>filters::</p>
          </div>
          <div className='col'>
            <button onClick={() => this.toggleNotPayed()} className={this.props.searchFilter.selPayedFilter === NOT_PAYED ? 'filter-active' : 'filter-inactive'} >
              not payed
            </button>
          </div>
          <div className='col'>
            <select id='activity-filter' name='selActivityFilter' value={this.props.searchFilter.selActivityFilter} onChange={this.updateFilterInput} >
              <option key='0' value=''>activity</option>
              {
                this.props.searchFilter.activityFilterOptions.map(item => {
                  return <option key={item.activityId} value={item.activityId}>{item.name}</option>
                })
              }
            </select>
          </div>
          <div className='col'>
            <select id='location-filter' name='selLocationFilter' value={this.props.searchFilter.selLocationFilter} onChange={this.updateFilterInput} >
              <option key='0' value=''>location</option>
              {
                this.props.searchFilter.locationFilterOptions.map(item => {
                  return <option key={item.locationId} value={item.locationId}>{item.name}</option>
                })
              }
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
          <button onClick={() => this.props.curModule.addComment()} >
            add note
          </button>
        </div>
      )
      buttonHtml.push(
        <div key="3" className='col'>
          <button onClick={() => this.props.curModule.toggleAddSession()} >
            add session
          </button>
        </div>
      )
      buttonHtml.push(
        <div key="4" className='col'>
          <button onClick={() => this.props.curModule.addUserPhone()} >
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

    if ((pathname === ROUTES.HOME_PAGE || pathname === ROUTES.SESSION_PAGE) && isLoggedIn) {
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
    sharedFlags: state.sharedFlags,
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

export default connect(mapStateToProps, mapDispatchToProps)(Header);