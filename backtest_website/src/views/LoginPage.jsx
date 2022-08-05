import React from 'react'
import { useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import './LoginPage.css'
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [usernameExist, setUsernameExist] = useState(true);
    const [correctPassword, setCorrectPassword] = useState(true);
    const nav = useNavigate();

    const onFinish = async (values) => {
        // console.log('Received values of form: ', values);
        const res = await userService.login(values);
        // console.log(res.data);
        const {message, err_code, user_id, username} = res.data;
        if (message === 'incorrect password') {
            setCorrectPassword(false);
        } else {
            setCorrectPassword(true);
        }
        if (message === 'username not exists') {
            setUsernameExist(false);
        } else {
            setUsernameExist(true);
        }
        if (err_code === 0) {
            localStorage.setItem('userId', user_id);
            localStorage.setItem('username', username);
            nav('/', {replace: true});
        }
    };
    
    const goSignUp = () => {
        // console.log('go sign up page')
        nav('/signup', {replace: true});
    }   

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
        >
            <Form.Item
            name="username"
            validateStatus = { !usernameExist && 'error'}
            help = { !usernameExist && 'username not exists.'}
            rules={[
                {
                required: true,
                message: 'Please input your Username!',
                },
            ]}
            >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
            </Form.Item>
            <Form.Item
            name="password"
            validateStatus = { !correctPassword && 'error'}
            help = { !correctPassword && 'incorrect password.'}
            rules={[
                {
                required: true,
                message: 'Please input your Password!',
                },
            ]}
            >
            <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
            />
            </Form.Item>

            {
                /* <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <a className="login-form-forgot" href="">
                    Forgot password
                </a>
                </Form.Item> */
            }   

            <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
                Log in
            </Button>
            Or <a onClick={goSignUp} href="">register now!</a>
            </Form.Item>
        </Form>
    );
}
