import React from 'react'
import { useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import './LoginPage.css'
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
    const nav = useNavigate();
    const [usernameExist, setUsernameExist] = useState(false)

    const onFinish = async (values) => {
        console.log('111Received values of form: ', values);
        const res = await userService.signup(values);
        console.log(res)
        const {message, err_code} = res.data
        if (err_code === 0) {
            goLogin();
        } else {
            setUsernameExist(true);
        }
    };
    
    const goLogin = () => {
        nav('/login', {replace: true});
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
            validateStatus = { usernameExist && 'error'}
            help = {usernameExist && 'username exists.'}
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
            {/* <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <a className="login-form-forgot" href="">
                Forgot password
            </a>
            </Form.Item> */}

            <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
                Sign up
            </Button>
            Or <a onClick={goLogin} href="">log in</a>
            </Form.Item>
        </Form>
    );
}
