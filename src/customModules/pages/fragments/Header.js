import React, { Component } from 'react';
import logo from '../../../static/logo.png';
class Header extends Component {
  render() {
    return (
      <div style={style.header}>
        <div style={style.spacer}></div>
        <img style={style.logo} src={logo} />
        <div style={style.spacer}></div>
      </div>
    );
  }
}

export default Header;

const style = {
  header: {
    flexDirection: 'row',
    flex: 0.25,
    minHeight: 200,
    backgroundColor: '#001a00',
  },
  logo: {
    flex: 1,
    height: undefined,
    width: undefined

  },
}