import { nanoid } from 'nanoid';
import React from 'react'
import TableItem from './TableItem';

export default function TableCol(props) {

    const {items, } = props

    return (
        <td style={{
            verticalAlign: 'top',
            borderSpacing: '0px',
            padding: '0px'
        }}>
            {
                items.map((item) => {
                    return <TableItem key={nanoid()} item={item} {...props} />
                }) 
            }
        </td>
    )
}
