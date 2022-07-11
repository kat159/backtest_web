import React, { Component } from 'react'
import MyNavLink from '../../nav_tab/MyNavLink'
import { Link, useHistory} from 'react-router-dom'
import './test.css'
import Header from './components/Header'
import PositionOpen from './components/PositionOpen/PositionOpen'
import PositionClose from './components/PositionClose/PositionClose'
import BacktestParam from './components/BacktestParams/BacktestParam'
import axios from 'axios'
import PubSub from 'pubsub-js'

export default class Test extends Component {
    
    state = {
        userId: this.props.match.params.userId,
        name: '',
        positionType: 'Long',
        openCriterion: [
            [[]],
        ], 
        closeCriterion: [
            [[]],
        ],
        openCriterionStr: '',
        closeCriterionStr: '',
        holdingDays: 1,
        testParams: {
            capital: 100000,
            capitalAtRisk: 5,
            commission: 0.08,
            bidAskSpread: 0.02,
            timePeriod: ['2020-01-01', '2021-01-01']
        }
    }

    onSaveClick = () => {
        const {
            userId, 
            name, 
            positionType,
            openCriterionStr, 
            closeCriterionStr, 
            holdingDays, 
            testParams, 
        } = this.state;
        console.log('Save Strategy: state =', this.state);
        axios.defaults.baseURL = 'http://127.0.0.1:3000';
        axios({
            method: 'post',
            url: '/strategies',
            data: JSON.stringify(this.state),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(
            res => {
                PubSub.publish('report_metrics', res.data);
                PubSub.publish('test_log', [Date(), this.state.name, ])
            },
            err => {console.log(err)}
        )
    }

    componentDidMount() {
        this.token1 = PubSub.subscribe('update_open_criterion', (msg, data) => {
            const {criteria, criteriaStr, forceClosing} = data;
            if (!forceClosing) 
                this.setState({openCriterion: criteria, openCriterionStr: criteriaStr});

        })
        this.token2 = PubSub.subscribe('update_close_criterion', (msg, data) => {
            const {criteria, criteriaStr, forceClosing} = data;
            if (!forceClosing)
                this.setState({closeCriterion: criteria, closeCriterionStr: criteriaStr});

        })
        this.token3 = PubSub.subscribe('update_holding_days', (msg, holdingDays) => {
            this.setState({holdingDays: holdingDays});
        })
        this.token4 = PubSub.subscribe('update_test_params', (msg, testParams) => {
            this.setState({testParams: testParams});
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token1);
        PubSub.unsubscribe(this.token2);
        PubSub.unsubscribe(this.token3);
        PubSub.unsubscribe(this.token4);
    }
    
    submit = () => {
        console.log(this.state);
        axios.defaults.baseURL = 'http://127.0.0.1:3000';
        axios({
            method: 'post',
            url: '/backtest',
            data: JSON.stringify(this.state),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(
            res => {
                PubSub.publish('report_metrics', res.data);
                PubSub.publish('test_log', [Date(), this.state.name, ])
            },
            err => {console.log(err)}
        )
    }

    

    render() {
        const {openCriterion, closeCriterion, testParams, openCriterionStr, closeCriterionStr} = this.state
        return (
            <div>    
                <form action="" method="GET">
                    <Header userId={this.state.userId} ref={c => this.header = c} />
                    <PositionOpen userId={this.state.userId} criterion={openCriterion} criteriaStr={openCriterionStr} />
                    <PositionClose userId={this.state.userId} criterion={closeCriterion} criteriaStr={closeCriterionStr} />
                    <BacktestParam userId={this.state.userId} testParams={testParams} />
                </form>
                <Link onClick={this.submit} className='btn btn-info' style={{marginLeft: '20px', marginRight: '20px'}} to='/test-report'>Run Test</Link>
                <button onClick={this.onSaveClick} className='btn btn-info' type='button'>Save Strategy</button>
            </div>
        )
    }
}
