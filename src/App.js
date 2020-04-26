import React, { Component } from 'react';
import './App.css';
import logo from './logo.png';

class App extends Component {
  render() {
    return (
        <div className="App">
          <header className="App-header">
            <img style={style.logo} src={logo} alt='not found' />
          </header>

          <div style={style.body}>

            <h1 className="App-title">:please create your account:</h1>
            <div>
              <form method='post' action='/test/endpoint' autocomplete="off">
                <label style={style.textFieldLabel}>
                  first name:
            <input style={style.textField}
                    type="text"
                    name="firstName"
                    autocomplete="off"
                  />
                </label >
                <br />
                <label style={style.textFieldLabel}>
                  last name:
               <input style={style.textField}
                    type='text'
                    name="lastName"
                    autocomplete="off"
                  />
                </label>
                <br />
                <label style={style.textFieldLabel}>
                  username:
               <input style={style.textField}
                    type="text"
                    name="username"
                  />
                </label>
                <br />
                <label style={style.textFieldLabel}>
                  password:
              <input style={style.textField}
                    name="password"
                    type="password"
                  />
                </label>
                <br />
                <button style={style.submitBtn} type='submit'>Submit</button>
              </form>

            </div>
          </div>
          <footer style={style.footer}>
          </footer>
        </div>
    );
  }
}


export default App;

const style = {

  body: {
    fontFamily: 'Terminus',
    padding: 20,
    fontSize: 28,
    color: '#9fff80'
  },
  textField: {
    fontFamily: 'Terminus',
    color: '#9fff80',
    border: 'none',
    borderBottom: '2px solid #9fff80',
    fontSize: 24,
  },
  submitBtn: {
    fontFamily: 'Terminus',
    color: '#9fff80',
    border: '2px solid #9fff80',
    fontSize: 26,
    cursor: 'pointer',
    margin: 10,
  },
  textFieldLabel: {
    fontFamily: 'Terminus',
    color: '#9fff80',
    fontSize: 24,
  },
  footer: {
    minHeight: 100,
   
  },
  logo: {
    width: '100%',
    height: 'auto',
    maxWidth: 600,
  }
}