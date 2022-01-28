import React, { Component } from 'react'
import TableRow from './TableRow'
import { Link } from 'react-router-dom'
import Content from './Content';
import Waiting from './Waiting';
import PubSub from 'pubsub-js';
import CapitalChart from './CapitalChart';

export default class TestReport extends Component {

    componentDidMount = () => {
        this.token1 = PubSub.subscribe('report_metrics', (msg, report) => {
            console.log('receive test report', report);
            this.setState({ ...report });
            console.log('current state:', this.state);
            this.setState({ reportReady: true });
        })
    }
    componentWillUnmount = () => {
        PubSub.unsubscribe(this.token1);
    }

    state = {
        reportReady: false,
        capitalFlow: [],
        date: [],
        metrics: {
            currentCapital: 100000,
            returnRate: 0,
            sharpe: -0.02,
            maxDrawdown: 0,
            standardDeviation: 0
        },
    }
    render() {
        const { reportReady, capitalFlow, date } = this.state

        return reportReady ? (
            <div>
                <Content {...this.state.metrics} />
                <CapitalChart capitalFlow={capitalFlow} date={date} />
            </div>
        ) : <Waiting />
    }
}
