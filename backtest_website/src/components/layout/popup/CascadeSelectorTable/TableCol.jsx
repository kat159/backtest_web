import { nanoid } from 'nanoid';
import React from 'react'
import TableItem from './TableItem';

export default function TableCol(props) {

    const { items, toolTips, itemDict, } = props
    const isItemCol = items && items[0] && itemDict[items[0]]
    return (
        <td style={{
            verticalAlign: 'top',
            borderSpacing: '0px',
            padding: '0px',
        }}>
            <div
                style={{
                    maxHeight: isItemCol ? '200px' : '',
                    overflow: isItemCol ? 'scroll' : '',
                    overflowX: isItemCol ? 'hidden' : '',
                }}
            >
                {
                    items.map((item) => {
                        return <TableItem toolTips={toolTips} key={nanoid()} item={item} {...props} />
                    })
                }
            </div>

        </td>
    )
}
