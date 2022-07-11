import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Log from './log/Log'
import LoginPage from './login_page/LoginPage'
import Test from './test/Test'
import TestReport from './test_report/TestReport'
import PubSub from 'pubsub-js'
import MyCriteriaPage from './my_criteria/MyCriteriaPage'
import MyStrategiesPage from './my_strategies/MyStrategiesPage'

export default class Content extends Component {

    state = {
        userId: -1,
        // **TODO: 为了数据安全防止别人直接用页面跳转，用nanoid替代这个简单的userId，然后建立一个映射，nanoid对应userId
    }

    componentDidMount() {
        this.token5 = PubSub.subscribe('login_status', (msg, data) => {
            this.setState({userId: data.userId});
            console.log('curState', this.state)
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token5);
    }

    render() {
        return (
            <div>
                <Switch>
                    <Route path='/test/:userId' component={Test} />
                    <Route path='/log/:userId' userId={this.state.userId} component={Log}/>
                    <Route path='/test-report/:userId' userId={this.state.userId}  component={TestReport} />
                    <Route path='/login/:userId' userId={this.state.userId} component={LoginPage} />
                    <Route path='/my_criteria/:userId' userId={this.state.userId} component={MyCriteriaPage} />
                    <Route path='/my_strategies/:userId' userId={this.state.userId} component={MyStrategiesPage} />
                    <Redirect to='/test/-1' userId={this.state.userId} />
                </Switch>
            </div>
        )
    }
}
