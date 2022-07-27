import React from 'react'
import { useState } from 'react'
import TableCol from './TableCol'
import criterionItemService from '../../../../services/criterionItemService'
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import PubSub from 'pubsub-js';

export default function CascadeSelectorTable(props) {

    const {itemClassificationList, itemDict, } = criterionItemService.getAll();
    const [typeItemsSelectedList, setTypeItemsSelected] = useState(['dummy']);
    const {onCriterionItemClickMsg, toolTips} = props // 告诉CriteriaBuilder 有用的item点击了
    const onSelectorItemClickMsg = 'criteria-table-selector-type-item'  // 告诉Table， 类型item点击了，有用的item用上面的msg

    useEffect(() => {
        const token1 = PubSub.subscribe(onSelectorItemClickMsg, (msg, data) => {
            const {index, item, } = data
            const tmp = [...typeItemsSelectedList].slice(0, index + 1);
            tmp[index + 1] = item
            setTypeItemsSelected(tmp)
        });
        return () => {
            PubSub.unsubscribe(token1);
        }
    })

    return (
        <table style={
            {
                display: 'block',
                padding: '10px',
            }
        }>  
            <tbody>
                <tr>
                    {
                        typeItemsSelectedList.map((typeItemSelected, index) => {
                            const colItems = itemClassificationList[index][typeItemsSelectedList[index]]
                            return <TableCol toolTips={toolTips} selectedItemName={typeItemsSelectedList[index+1]} items={colItems} onSelectorItemClickMsg={onSelectorItemClickMsg} onCriterionItemClickMsg={onCriterionItemClickMsg} key={nanoid()} index={index} itemDict={itemDict} />
                        })
                    }
                </tr>
            </tbody>
        </table>
    )
}
