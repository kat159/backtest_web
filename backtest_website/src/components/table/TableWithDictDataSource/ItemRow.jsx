import { nanoid } from 'nanoid'
import React from 'react'

export default function ItemRow(props) {
  const {data, columns} = props
  return (
    <tr className='my-table-row' >
      {
        columns.map(column => {
          return <td key={nanoid}>{data[column.dataIndex]}</td>
        })
      }
    </tr>
  )
}
