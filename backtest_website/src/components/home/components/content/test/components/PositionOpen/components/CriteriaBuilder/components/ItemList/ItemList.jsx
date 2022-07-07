import { nanoid } from 'nanoid';
import React from 'react'
import Item from './components/Item/Item';

export default function ItemList(props) {

    const {itemList, colNum, itemsSelected, functionRules} = props;
    
    return (
            <td style={
                {
                    verticalAlign: 'top',
                    backgroundColor: '#c4cbff', // #e6e9ff
                }
            }>
                {
                    itemList.map(
                        item => <Item {...props} item={item} key={nanoid()}></Item>
                    )
                }
            </td>
    )
}
