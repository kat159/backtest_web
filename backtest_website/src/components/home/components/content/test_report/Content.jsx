import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Content extends Component {
    
    render() {
        const {currentCapital,returnRate,sharpe, maxDrawdown, standardDeviation} = this.props;
        console.log(currentCapital,returnRate,sharpe, maxDrawdown, standardDeviation)
        return (
            <div>
                <h2>TEST REPORT</h2>
                <div className='my-fieldset'>
                    <div className='my-fieldset-content'>
                        <div>Final Capital &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{currentCapital} </div>
                        <div>Returns % &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {returnRate}</div>
                        <div>Sharpe Ratio &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {sharpe}</div>
                        <div>Standard Deviation % &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{maxDrawdown}</div>
                        <div>Max Drawdown % &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {standardDeviation} </div>
                        {/* {
                        dataList.map((data, i) => {
                            return <TableRow data={data} key={i} />
                        })
                    } */}
                    </div>
                </div>
                <Link className='btn btn-info test-report-btn' style={{marginLeft: '20px'}} to='/test'>Return to Test Page</Link>
            </div>
        )
    }
}
