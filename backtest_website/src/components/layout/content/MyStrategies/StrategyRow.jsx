import { Button } from 'antd'
import React from 'react'

export default function StrategyRow(props) {
    const { strategy, onEditButtonClick, onDeleteButtonClick, onRunTestButtonClick} = props

    return (
        <tr className='my-table-row'>
            <td style={{ padding: '5px' }}>{strategy.name}</td>
            <td style={{ padding: '5px' }}>{strategy.description}</td>
            <td style={{ padding: '5px' }}>
                <Button type='link' onClick={onEditButtonClick(strategy)} style={{ padding: '5px' }}>Edit</Button>
                <Button type='link' onClick={onDeleteButtonClick(strategy.id)} style={{ padding: '5px' }}>Delete</Button>
                <Button type='link' onClick={onRunTestButtonClick(strategy)} style={{ padding: '5px' }}>Run Test</Button>
            </td>
        </tr>
    )
}
