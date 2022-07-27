import { nanoid } from 'nanoid'
import React from 'react'
import CriterionRow from './CriterionRow'

export default function CriteriaTable(props) {
  const {criterionList, onEditBottunClickMsg, onDeleteButtonClickMsg} = props
  return (
    <table className='my-table'>
      <thead className='my-table-header' >
        <tr >
          <td className='my-table-header-item' style={{padding: '5px', paddingRight: '20px'}}>Name</td>
          <td className='my-table-header-item' style={{padding: '5px', paddingRight: '20px'}}>Description</td>
          <td className='my-table-header-item' style={{padding: '5px', paddingRight: '20px'}}>Action</td>
        </tr>
      </thead>
      <tbody>
        {
          criterionList.map((criterion) => {
            return <CriterionRow onDeleteButtonClickMsg={onDeleteButtonClickMsg} onEditBottunClickMsg={onEditBottunClickMsg} criterion={criterion} key={nanoid()} />
          })
        }
      </tbody>
    </table>
  )
}
