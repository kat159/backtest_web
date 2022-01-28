import React, { Component } from 'react'
import PubSub from 'pubsub-js'

export default class HoldingDays extends Component {
    handleBlur = (event) => {
        PubSub.publish('update_holding_days', event.target.value)
        // updateCriteria(index, [this.value1.value, this.type.value, this.value2.value])
        // console.log(this.value1.value + this.type.value + this.value2.value)
    }

    render() {
        return (
            <div>
                <div className="field">
                    <label>Close position after &nbsp;&nbsp;
                        <input onBlur={this.handleBlur} ref={c => this.holdingDays = c} type='text' name='?' defaultValue='1' /> &nbsp;
                        trading days
                    </label>
                </div>
            </div>
        )
    }
}
