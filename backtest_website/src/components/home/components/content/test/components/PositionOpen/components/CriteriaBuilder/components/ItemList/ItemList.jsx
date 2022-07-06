import { nanoid } from 'nanoid';
import React from 'react'
import Item from './components/Item/Item';

export default function ItemList(props) {

    const {itemList, } = props;

    return (
            <td style={
                {
                    padding: '5px',
                    paddingRight: '10px',
                    paddingBottom: '2px',
                    verticalAlign: 'top',
                    minWidth: '50px'
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
