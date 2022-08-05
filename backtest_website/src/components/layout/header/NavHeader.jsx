import React, { useEffect, useState } from 'react'
import { AppstoreOutlined, MailOutlined, SettingOutlined, CalculatorOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
export default function NavHeader() {
    const nav = useNavigate();
    const items = [
        {
            // label: (<NavLink to='/backtest' >Back Test</NavLink>),
            label: 'Back Test',
            key: 'backtest',
        },
        {
            // label:  (<NavLink to='/my_criteria' >My Criteria</NavLink>),
            label: 'My Criteria',
            key: 'my_criteria',
        },
        {
            // label:  (<NavLink to='/my_strategies' >My Strategies</NavLink>),
            label: 'My Strategies',
            key: 'my_strategies',
        },
        {
            // label:  (<NavLink to='/backtest_logs' >Backtest Logs</NavLink>),
            label: 'Backtest Logs',
            key: 'backtest_logs',
        },
    ];
    const location = useLocation();
    let path = location.pathname;
    let indexOFsecondDash = path.indexOf('/', 1);
    const [current, setCurrent] = useState(path.slice(1, indexOFsecondDash === -1 ? path.length : indexOFsecondDash));
    useEffect(() => {
        let path = location.pathname;
        let indexOFsecondDash = path.indexOf('/', 1);
        setCurrent(path.slice(1, indexOFsecondDash === -1 ? path.length : indexOFsecondDash));
    }, [location]);

    const onClick = (e) => {
        // console.log('click ', e);
        setCurrent(e.key);
        nav(e.key, { replace: true });
    };
    return (
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
    )
}
