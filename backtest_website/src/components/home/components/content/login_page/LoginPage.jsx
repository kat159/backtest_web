import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PubSub from 'pubsub-js'

export default class LoginPage extends Component {

    state = {
        UsernameExist: false,
        invalidUsername: false,
        invalidPassword: false,
        successSignUp: false,
    }

    userData = {username: '', password: ''}

    handleKeyUp = (event) => {
        const {target} = event
        const {name} = target
        this.userData[name] = target.value
        console.log(this.userData)
    }
    
    login = () => {
        axios.defaults.baseURL = 'http://127.0.0.1:3000';
        axios({
            method: 'get',
            url: '/users',
            params: this.userData,
        }).then(
            res => {
                // console.log('result：', res.data.results);
                const result = res.data.results[0];
                
                if (result === undefined) { 
                    // username not exist
                    this.setState({invalidUsername: true, invalidPassword: false, UsernameExist: false, successSignUp: false})
                } else if (result.password !== this.userData.password) { 
                    // incorrect password
                    this.setState({invalidUsername: false, invalidPassword: true, UsernameExist: false, successSignUp: false});
                } else { 
                    // sucessfully logged in
                    this.setState({invalidPassword: false, invalidUsername: false, UsernameExist: false, successSignUp: false})
                    PubSub.publish('login_status', {loggedIn: true, userId:result.id, username: this.userData.username});
                    this.props.history.push('/test/' + result.id);
                }
            },
        )
    }

    signUp = () => {
        axios.defaults.baseURL = 'http://127.0.0.1:3000';
        axios({
            method: 'post',
            url: '/users',
            data: this.userData, 
            // 如果params换成data(body)， 简单的设置allow origin无法跨域，可能是含body post就会发送两次请求(optional)？
            // 好像fetch的post带body不会发送optional？
        }).then(
            res => {
                console.log(res);
                if (res.data.err_code === 1) { 
                    // user exist
                    this.setState({UsernameExist: true, successSignUp: false, invalidPassword: false, invalidUsername:false, })
                } else {
                    this.setState({successSignUp: true, invalidPassword: false, invalidUsername:false, UsernameExist: false});
                }
                console.log(this.state)
            },
        )
    }

    render() {
        return (
            <div>
                <form action='/login' method='post' id='loginForm'>
                    <div className="field">
                        <label>Username: &nbsp;&nbsp;&nbsp;&nbsp;
                            <input ref={c => this.username = c} onKeyUp={this.handleKeyUp} type='text' name='username' />
                            {
                                this.state.UsernameExist ? <span> Username exists ! </span> : 
                                this.state.invalidUsername ? <span> Username not exists !</span> : <span></span>
                            }
                        </label>
                    </div>
                    <div className="field">
                        <label>Password: &nbsp;&nbsp;&nbsp;&nbsp;
                            <input ref={c => this.password = c} onKeyUp={this.handleKeyUp} type='text' name='password' />
                            {
                                this.state.invalidPassword ? <span> Incorrect password ! </span> : <span></span>
                            }
                        </label>
                    </div>
                    <button onClick={this.login} className='btn btn-info' style={{ marginLeft: '20px' }} type='button' id='username' >login</button>
                    <button onClick={this.signUp} className='btn btn-info' style={{ marginLeft: '20px' }} type='button' id='password' >sign up</button>
                    <br />
                    {
                        this.state.successSignUp ? <div>'sign up successfully!'</div> : <div></div>
                    }
                </form>
                
                {/* <Link className='btn btn-info' style={{ marginLeft: '20px' }} to='/test'>Login</Link> */}
            </div>
        )
    }
}
