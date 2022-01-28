import React, { Component } from 'react'
import LoginTab from '../login_tab/LoginTab'
import MyNavLink from './MyNavLink'
import PubSub from 'pubsub-js'  
 
export default class NavHeader extends Component {
    state = {
        loggedIn: false,
        username: '',
    }

    componentDidMount() {
        this.token = PubSub.subscribe('login_status', (msg, data) => {
            this.setState(data);
            console.log('11111111111111', data);
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token);
    }

    render() {
        return (
            <div className='nav-header'>
                <ul className="nav nav-tabs">
                    <li>
                        <MyNavLink className="list-group-item" to='/test' >Strategy Test</MyNavLink>
                    </li>
                    <li>
                        <MyNavLink className="list-group-item" to='/log' >Backtest Log</MyNavLink>
                    </li>
                </ul>
                <LoginTab {...this.state} />
            </div>
        )
    }
}
