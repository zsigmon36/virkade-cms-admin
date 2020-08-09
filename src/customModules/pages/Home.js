import React, { Component } from 'react';
import Header from './fragments/Header.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Home extends Component {

    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this)
    }

    state = {
    }

    componentDidMount() {
        this.loading(false)
    }
    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
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
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

