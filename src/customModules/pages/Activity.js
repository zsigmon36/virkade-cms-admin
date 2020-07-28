import React, { Component } from 'react';
import Header from './fragments/Header.js'
import userAction from '../reduxActions/UserAction'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Loader from './fragments/Loader.js';

class Activity extends Component {

    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this)
    }

    state = {
        loading: true,
    }

    componentDidMount() {
        this.setState({ loading: false })
    }
    loading(data) {
        let loading = data || false;
        this.setState({ loading: loading })
        return true
    }

    nextPage(pageName) {
        this.loading(true)
        this.props.navigation.navigate(pageName)
        this.loading(false)
    }

    render() {
        return (
            <div className='wrapper'>
                <Loader loading={this.state.loading} />
                <Header history={this.props.history} />
                <div className='row'>
                    <div className='rowFirst'>
                        <h2>::pending sessions::</h2>
                    </div>
                </div>
                <div className='row'>
                    <table>

                    </table>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(userAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Activity);

