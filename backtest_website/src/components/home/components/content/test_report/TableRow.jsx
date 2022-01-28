import React, { Component } from 'react'

export default class TableRow extends Component {

    render() {
        const {data} = this.props
        return (
        <tr>
            {
                data.map((d, i) => <td key={i} >{d}</td>)
            }
        </tr>
        )
    }
}