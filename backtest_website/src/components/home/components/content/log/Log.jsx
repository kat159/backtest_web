import React, { Component } from 'react'
import TableRow from './TableRow'
import PubSub from 'pubsub-js'

export default class Log extends Component {
    
         
    render() {
        // TODO: pull from database
        const dataList = [
            ['2021-01-01', 'Strategy1', -20, 0.7, 20]
        ]
        return (
            <div>
                <table> 
                <caption></caption>
                <thead>
                <tr>
                    <th>Test Date</th>
                    <th>Strategy Name</th>
                    <th>Average Profit %</th>
                    <th>Sharpe Ratio</th>
                    <th>Max Drawdown %</th>
                </tr>
                </thead>

                <tbody>
                    {
                        dataList.map((data, i) => {
                            return <TableRow data={data} key={i} />
                        })
                    }
                </tbody>

            </table>
            </div>
        )
    }
}
