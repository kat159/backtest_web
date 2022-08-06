import { nanoid } from 'nanoid'
import React from 'react'
import ItemRow from './ItemRow'

export default function MyTableWithDictDataSource(props) {
    const { columns, dataSource } = props

    return (
        <table className='my-table'>
            <thead className='my-table-header' >
                <tr >
                    {
                        columns.map(column => {
                            return <td key={nanoid()}>{column.title}</td>
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    dataSource.map(data => {
                        return <ItemRow key={nanoid()} columns={columns} data={data} />
                    })
                }
            </tbody>
        </table>
    )
}
