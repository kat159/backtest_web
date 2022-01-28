import React, { Component } from 'react'
import PubSub from 'pubsub-js'
export default class Criteria extends Component {

    handleBlur = () => {
        let {index} = this.props
        PubSub.publish('update_open_criterion', {index, criteria: [this.value1.value, this.type.value, this.value2.value]})
        // updateCriteria(index, [this.value1.value, this.type.value, this.value2.value])
        // console.log(this.value1.value + this.type.value + this.value2.value)
    }

    handleSelectChange = () => {
        let {index} = this.props
        PubSub.publish('update_open_criterion', {index, criteria: [this.value1.value, this.type.value, this.value2.value]})
        // let {index, updateCriteria} = this.props
        // updateCriteria(index, [this.value1.value, this.type.value, this.value2.value])
        // console.log(this.value1.value + this.type.value + this.value2.value)
    }

    render() {
        const {criteria} = this.props
        return (
            <div className="field">
                <label className='select-box'>
                    <select onChange={this.handleSelectChange} defaultValue={criteria[0]} ref={c => this.value1 = c} name='value1'>
                        <option value='CLOSE' >Closing Price</option>
                        <option value='OPEN' >Opening Price</option>
                        <option value='HIGH' >Highest Price </option>
                        <option value='LOW' >Lowest Price</option>
                    </select>
                </label>
                <label className='select-box'>
                    <select onChange={this.handleSelectChange} defaultValue={criteria[1]} ref={c => this.type = c} name='type'>
                        <option value='>' >Higher than</option>
                        <option value='<'>Lower than</option>
                        <option value='=='>Equal to</option>
                    </select>
                </label>
                <label className='select-box'>
                    <input onBlur={this.handleBlur} ref={c => this.value2 = c} name='value2' type='number' defaultValue={criteria[2]} >
                    </input >&nbsp;$
                </label>
            </div>
        )
    }
}
