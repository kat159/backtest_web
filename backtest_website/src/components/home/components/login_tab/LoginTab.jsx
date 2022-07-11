import React, { Component } from 'react'
import MyNavLink from '../nav_tab/MyNavLink'
import PubSub from 'pubsub-js'

export default class LoginTab extends Component {

    logout = () => {
        PubSub.publish('login_status', {userId: -1, loggedIn: false}); 
        console.log('Log out')
    }

    render() {
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
                        <MyNavLink to={'/login/' + this.props.userId} >login</MyNavLink>
                        <span> / </span>
                        <MyNavLink to={'/login/' + this.props.userId} >sign up</MyNavLink>
                    </div>
                }
            </div>


        )
    }
}
