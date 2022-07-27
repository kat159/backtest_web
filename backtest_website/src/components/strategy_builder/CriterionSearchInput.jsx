import { Button, Form, Input, Select, Tag } from 'antd';
import qs from 'qs';
import React, { useEffect, useRef, useState } from 'react';
import criterionService from '../../services/criterionService';
import { EditOutlined, } from '@ant-design/icons'
import './CriterionSearchInput.css'
import CriteriaBuilder from '../layout/popup/CriteriaBuilder';
import DraggablePoppup from '../layout/popup/DraggablePoppup';
import { useForm } from 'antd/lib/form/Form';
import { nanoid } from 'nanoid';

const { Option } = Select;
const { CheckableTag } = Tag;

export default function CriterionSearchInput(props) {
    const userId = localStorage.getItem('userId')
    const { formRef, } = props

    const onTagMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const tagRender = (props) => {
        const { label, value, closable, onClose } = props;

        const onPreventMouseDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        return (
            <Tag
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{
                    marginRight: 3,
                }}
            >
                {label}
            </Tag>
        );
    };

    let timeout;
    let currentValue;
    const fetch = (value, callback) => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = value; // **注意，这里不会改变外面的currentValue值，只会在内部保存这个值，在整个函数完成后，currentValue值会消失
        // (不是js的特性，js会改变，但是因为react每次callback()改变状态后，currentValue又重置了？)

        const fake = () => {
            criterionService.suggestAllWithName(userId, value).then(
                res => {
                    if (currentValue === value) {
                        const { results, err_code, } = res;
                        const data = results.map((item) => ({
                            value: item.name,
                            text: item.name,
                            criterionStr: item.criterion_str,
                            criterionId: item.id,
                            criterionName: item.name,
                            nestedCriterion: item.criterion_arr,
                            description: item.description,
                        }));
                        callback(data);
                    }
                },
                err => {
                }
            )
        };
        timeout = setTimeout(fake, 300);
    };

    const [data, setData] = useState([]); // 搜索出来的选项
    const [value, setValue] = useState(); // 点击选择的内容，不是输入框的内容
    
    useEffect(()=>{
        fetch('', setData);
    }, [])

    const handleSearch = (newValue) => { //input搜索的text内容变化的时候
        fetch(newValue, setData);
    };

    const handleChange = (newValue) => { // 输入框改变不会触发，点击选择才会触发
        console.log(newValue)
        setValue(newValue);             // antd Form的value不会随这个value改变，只能通过useForm().setFieldsValue改变
    };
    const [criterionEditing, setCriterionEditing] = useState(undefined);
    const onEditFinishCallback = async () => {
        // 重新fectch data， (选择框搜索出来的选项)
        // ANTD直接清空了，之后用自己写的搜索框试试
        // 虽然你清空， 但是对于''的搜索内容还是以前的，还要重新fetch
        fetch('', setData);

        setCriterionEditing(undefined);
    }
    const onForceCloseCallback = () => {
        setCriterionEditing(undefined);
    }
    const handleEdit = (criterion) => {
        return async (event) => {
            event.stopPropagation();
            const res = await criterionService.getCriterionById(criterion.criterionId);
            setCriterionEditing({ criterionId: res.id, criterionName: res.name, nestedCriterion: res.criterion_arr });
        }
    }

    const options = data.map((d) =>
        <Option value={d.criterionId} title={d.description} key={d.value}>
            {d.text}
            <EditOutlined className='my-action-tag' v={d} onClick={handleEdit(d)} style={
                {
                    marginLeft: '7px',
                }
            }
            />
        </Option>
    );
    

    return (
        <div>
            {criterionEditing && <CriteriaBuilder onForceCloseCallback={onForceCloseCallback} criterionBeingEdited={criterionEditing} onFinishCallback={onEditFinishCallback} />}
            <Form.Item label='Selected Criterion' name={props.name}
                
                className='criteria-selector'
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select
                    onClick={() => {fetch('', setData)}}
                    mode='multiple'
                    tagRender={tagRender}
                    showSearch
                    placeholder={props.placeholder}
                    showArrow
                    style={props.style}
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onSearch={handleSearch}
                    onChange={handleChange}
                    notFoundContent={null}
                >
                    {options}
                </Select>
            </Form.Item>
        </div>


    );
};

