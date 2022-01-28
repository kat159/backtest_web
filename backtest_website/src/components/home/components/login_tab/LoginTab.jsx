import React, { Component } from 'react'
import MyNavLink from '../nav_tab/MyNavLink'
import PubSub from 'pubsub-js'

export default class LoginTab extends Component {

    logout = () => {
        PubSub.publish('login_status', {loggedIn: false}); 
    }

    render() {
        console.log('222222', this.props);
        const { loggedIn, username } = this.props;
        return (
            <div>
                {
                    loggedIn ? 
                    <div>
                        {username} &nbsp;&nbsp; 
                        <button onClick={this.logout}>log out</button>
                    </div> : 
                    <div>
                        <MyNavLink to='/login'>login</MyNavLink>
                        <span> / </span>
                        <MyNavLink to='/login'>sign up</MyNavLink>
                    </div>
                }
            </div>


        )
    }
}
