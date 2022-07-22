import React from 'react'
import { Button, Form, Input, Select, Space, Tooltip, Typography, Radio } from 'antd';
import CriterionSearchInput from './CriterionSearchInput';

export default function PositionOpen(props) {

    

    return (
        <div>
            <legend style={{paddingLeft: '20px', fontSize: '20px'}}><b>Position Opening Criteria</b></legend>
            <CriterionSearchInput form={props.form} formRef={props.formRef} name="openCriteriaIdList" />
            <Form.Item label='All criteria in login condiction' name='openCriteriaLogic'
            >
                <Radio.Group >
                    <Radio value='and'>and</Radio>
                    <Radio value='or'>or</Radio>
                </Radio.Group>
            </Form.Item>
            
        </div>
        
    )
}
