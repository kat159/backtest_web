import React, { Component } from 'react'
import PubSub from 'pubsub-js'

export default class BacktestParam extends Component {
    handleBlur = () => {
        const newParams = {
            capital: this.capital.value,
            capitalAtRisk: this.capitalAtRisk.value,
            commission: this.commission.value,
            bidAskSpread: this.bidAskSpread.value,
            timePeriod: [this.startDate.value, this.endDate.value],
        }
        PubSub.publish('update_test_params', newParams)
    }

    render() {
        const {capital, capitalAtRisk, commission, bidAskSpread, timePeriod} = this.props.testParams        
        return (
            <div>
                <fieldset onBlur={this.handleBlur}>
                    <legend className='legend'>Backtest Parameters</legend>
                    <div className="field">
                        <label>Initial Capital &nbsp;&nbsp;
                            <input ref={c => this.capital = c} type='number' name='capital' defaultValue={capital} /> &nbsp;
                            $
                        </label>
                    </div>
                    <div className="field">
                        <label>Capital at Risk &nbsp;&nbsp;
                            <input ref={c => this.capitalAtRisk = c} type='text' name='capitalAtRisk' defaultValue={capitalAtRisk} /> &nbsp;
                            % of capital
                        </label>
                    </div>
                    <div className="field">
                        <label>Commission &nbsp;&nbsp;
                            <input ref={c => this.commission = c} type='text' name='commission' defaultValue={commission} /> &nbsp;
                            % of open position
                        </label>
                    </div>
                    <div className="field">
                        <label>Bid-Ask Spread &nbsp;&nbsp;
                            <input ref={c => this.bidAskSpread = c} type='text' name='bidAskSpread' defaultValue={bidAskSpread} /> &nbsp;
                            $
                        </label>
                    </div>
                    <div className="field">
                        <label>Testing Time Period &nbsp;&nbsp;
                            <input ref={c => this.startDate = c} style={{width:'150px'}} type='date' name='startDate' defaultValue={timePeriod[0]} /> &nbsp;
                            to &nbsp;
                            <input ref={c => this.endDate = c} style={{width:'150px'}} type='date' name='endDate' defaultValue={timePeriod[1]} />
                        </label>
                    </div>
                </fieldset>
            </div>
        )
    }
}
