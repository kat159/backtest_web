import React, { Component } from 'react'
import Criteria from './Criteria'
import HoldingDays from './HoldingDays'
import { nanoid } from 'nanoid'

export default class PositionClose extends Component {
    render() {
        return (
            <div>
                <fieldset>
                    <legend className='legend'>Position Closing</legend>
                    <HoldingDays />
                    {
                        this.props.criterion.map((criteria, i) => {
                            return <Criteria key={nanoid()} index={i} criteria={criteria} />
                        })
                    }
                </fieldset>
            </div>
        )
    }
}
