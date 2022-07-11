import React, { Component } from 'react'
import LoginTab from '../login_tab/LoginTab'
import MyNavLink from './MyNavLink'
import PubSub from 'pubsub-js'  
 
export default class NavHeader extends Component {
    // 待解决： 用户登录后，刷新导致图标变成没登录转态，
    state = {
        loggedIn: false,
        username: '',
        userId: -1,
    }

    componentDidMount() {
        console.log('Receive Login Status:', this.state);
        this.token = PubSub.subscribe('login_status', (msg, data) => {
            this.setState(data);
            console.log('Receive Login Status:', data);
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
                        <MyNavLink className="list-group-item" to={'/test/' + this.state.userId} >Strategy Test</MyNavLink>
                    </li>
                    <li>
                        <MyNavLink className="list-group-item" to={'/my_criteria/' + this.state.userId} >My Criteria</MyNavLink>
                    </li>
                    <li>
                        <MyNavLink className="list-group-item" to={'/my_strategies/' + this.state.userId} >My Strategies</MyNavLink>
                    </li>
                    <li>
                        <MyNavLink className="list-group-item" to={'/log/' + this.state.userId} >Backtest Log</MyNavLink>
                    </li>
                </ul>
                <LoginTab {...this.state} />
            </div>
        )
    }
}
