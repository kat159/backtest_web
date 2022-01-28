
import React, { Component } from 'react'

export default class TableRow extends Component {

    render() {
        const {data} = this.props
        return (
        <tr>
            <td>{data[0]}</td>
            <td>{data[1]}</td>
            <td>{data[2]}</td>
            <td>{data[3]}</td>
            <td>{data[4]}</td>
        </tr>
        )
    }
}
