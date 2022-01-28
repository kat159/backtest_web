import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Log from './log/Log'
import LoginPage from './login_page/LoginPage'
import Test from './test/Test'
import TestReport from './test_report/TestReport'
import PubSub from 'pubsub-js'

export default class Content extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path='/test' component={Test} />
                    <Route path='/log' component={Log}/>
                    <Route path='/test-report' component={TestReport} />
                    <Route path='/login' component={LoginPage} />
                    <Redirect to='/test' />
                </Switch>
            </div>
        )
    }
}
