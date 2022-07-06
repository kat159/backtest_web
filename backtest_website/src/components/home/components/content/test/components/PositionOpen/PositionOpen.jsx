import React, { Component } from 'react'
import Criteria from './components/Criteria/Criteria'
import {nanoid} from 'nanoid'
import PubSub from 'pubsub-js'
import CriteriaBuilder from './components/CriteriaBuilder/CriteriaBuilder'

export default class PositionOpen extends Component {
    conditions = []

    // state = {
    //     count: 0,
    //     criterion: [
    //         ['CLOSE', '>', '100'],
    //     ]
    // }

    // updateCriteria = (index, criteria) => {
    //     // let newCriterion = this.state.criterion
    //     // newCriterion[index] = criteria
    //     // console.log(this.state.criterion)
    //     // // console.log(newCriterion[index].join(''))
    //     // this.setState({criterion: newCriterion})
    // }

    addCriteria = () => {
        PubSub.publish('add_open_criteria', ['Close', '>', '100'])
        // this.setState({count: this.state.count + 1})
        // this.state.criterion.push(['22', '22', '22'])
        // this.setState(this.state.criterion)
    }
    
    render() {
        
        return (
            <div>
                <CriteriaBuilder />
                <fieldset >
                    <legend className='legend'>Position Opening</legend>
                    {
                        this.props.criterion.map((criteria, i) => {
                            return <Criteria key={nanoid()} index={i} criteria={criteria} />
                        })
                    }
                    <button className='btn btn-info' type='button' ref={c => this.btn = c} onClick={this.addCriteria}>addCriteria</button>
                </fieldset>
            </div>
        )
    }
}
