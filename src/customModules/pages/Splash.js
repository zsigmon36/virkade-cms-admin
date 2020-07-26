import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableNativeFeedback
} from 'react-native' 
import Header from './Header.js'
import style from '../static/styles.js'

class Splash extends Component {
    
    render() {
        return (
            <View style={style.wrapper}>
            <Header/>
            <View style={style.body}>
                <View style={style.spacer}></View>
                <View style={style.main}>

                    <View style={style.colFirst}>
                        <Text style={style.h1}>::choose one::</Text>
                    </View>

                    <View style={style.col}>
                        <TouchableNativeFeedback onPress={() => this.props.navigation.navigate('Login')}>
                            <View style={style.next}>
                                <Text style={style.label}>login</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                    <View style={style.col}>
                        <TouchableNativeFeedback onPress={() => this.props.navigation.navigate('BasicAccount')}>
                            <View style={style.next}>
                                <Text style={style.label}>register</Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
                <View style={style.spacer}></View>
            </View>
            </View>
        );
    }
}

export default Splash;