import { nanoid } from 'nanoid'
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import strategyService from '../../../../services/strategyService';
import StrategyRow from './StrategyRow'

export default function StrategyTable(props) {
    const {strategyList, onDeleteButtonClick, onEditButtonClick, onRunTestButtonClick} = props

    return (
        <table className='my-table'>
            <thead className='my-table-header'>
                <tr >
                    <td className='my-table-header-item' style={{ padding: '5px' }}>Name</td>
                    <td className='my-table-header-item' style={{ padding: '5px' }}>Description</td>
                    <td className='my-table-header-item' style={{ padding: '5px'}}>Action</td>
                </tr>
            </thead>
            <tbody>
                {
                    strategyList.map((strategy) => {
                        return <StrategyRow onRunTestButtonClick={onRunTestButtonClick} onEditButtonClick={onEditButtonClick} onDeleteButtonClick={onDeleteButtonClick} strategy={strategy} key={nanoid()} />
                    })
                }
            </tbody>
        </table>
    )
}
