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
        name: '',
        positionType: 'Long',
        openCriterion: [
            ['CLOSE', '>', '1'],
        ], 
        closeCriterion: [
            ['CLOSE', '>', '1'],
        ],
        holdingDays: 1,
        testParams: {
            capital: 100000,
            capitalAtRisk: 5,
            commission: 0.08,
            bidAskSpread: 0.02,
            timePeriod: ['2020-01-01', '2021-01-01']
        }
    }

    componentDidMount() {
        this.token1 = PubSub.subscribe('update_open_criterion', (msg, data) => {
            const {index, criteria} = data;
            console.log(criteria)
            const newCriterion = this.state.openCriterion;
            newCriterion[index] = criteria;
            this.setState({openCriterion: newCriterion});
        })
        this.token2 = PubSub.subscribe('add_open_criteria', (msg, criteria) => {
            const newCriterion = this.state.openCriterion;
            newCriterion.push(criteria);
            this.setState({openCriterion: newCriterion});
        })
        this.token3 = PubSub.subscribe('update_close_criterion', (msg, data) => {
            const {index, criteria} = data;
            console.log(criteria)
            const newCriterion = this.state.closeCriterion;
            newCriterion[index] = criteria;
            this.setState({closeCriterion: newCriterion});
        })
        this.token4 = PubSub.subscribe('add_close_criteria', (msg, criteria) => {
            const newCriterion = this.state.closeCriterion;
            newCriterion.push(criteria);
            this.setState({closeCriterion: newCriterion});
        })
        this.token5 = PubSub.subscribe('update_holding_days', (msg, holdingDays) => {
            this.setState({holdingDays: holdingDays});
        })
        this.token6 = PubSub.subscribe('update_test_params', (msg, testParams) => {
            this.setState({testParams: testParams});
        })
    }

    componentWillUnmount() {
        PubSub.unsubscribe(this.token1);
        PubSub.unsubscribe(this.token2);
        PubSub.unsubscribe(this.token3);
        PubSub.unsubscribe(this.token4);
        PubSub.unsubscribe(this.token5);
        PubSub.unsubscribe(this.token6);
    }
    
    submit = () => {
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
        const {openCriterion, closeCriterion, testParams} = this.state
        return (
            <div>
                
                <form action="http://localhost:3333/run_test" method="GET">
                    <Header ref={c => this.header = c} />
                    <PositionOpen criterion={openCriterion} ref={c => this.positionOpen = c} />
                    <PositionClose criterion={closeCriterion} ref={c => this.positionClose = c} />
                    <BacktestParam testParams={testParams} ref={c => this.backtestParam = c} />
                </form>
                <Link onClick={this.submit} className='btn btn-info' style={{marginLeft: '20px'}} to='/test-report'>Run Test</Link>
                
            </div>
        )
    }
}
