import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ROUTES } from '../../VirkadeAdminPages';
class Header extends Component {

  state = {
    payedFilter: false
  }

  controlButtons() {
    let buttonHtml = [];
    let pathname = this.props.history.location.pathname || '/';
    let isLoggedIn = this.props.user.authToken.token.length > 0
    //common filters
    if (pathname === ROUTES.HOME_PAGE) {
      buttonHtml.push(
        <div className='col filters'>
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
      <div className='col row-filler'>
      </div>
    )

    if (pathname === ROUTES.USER_PAGE) {
      buttonHtml.push(
        <div className='col'>
          <button onClick={() => alert("click test")} >
            add note
          </button>
        </div>
      )
      buttonHtml.push(
        <div className='col'>
          <button onClick={() => alert("click test")} >
            add session
          </button>
        </div>
      )
      buttonHtml.push(
        <div className='col'>
          <button onClick={() => alert("click test")} >
            update user
          </button>
        </div>
      )
    }

    if (pathname !== ROUTES.HOME_PAGE) {
      buttonHtml.push(
        <div className='col'>
          <button onClick={() => this.props.history.push(ROUTES.HOME_PAGE)} >
            home
          </button>
        </div>
      )
    }

    if (pathname === ROUTES.HOME_PAGE && isLoggedIn) {
      buttonHtml.push(
        <div className='col'>
          <button onClick={() => this.props.history.push(ROUTES.SEARCH_PAGE)} >
            user search
          </button>
        </div>
      )
    }

    //login is always last
    buttonHtml.push(
      <div className='col'>
        <button onClick={() => alert("click test")} >
          {isLoggedIn ? 'sign out' : 'sign in'}
        </button>
      </div>
    )
    return buttonHtml;
  }

  render() {
    return (
      <div className='header'>
        <div className='col logo'>
        </div>
        <div className='col spacer'>
        </div>
        {
          this.controlButtons()
        }
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user
  }
}
export default connect(mapStateToProps)(Header);