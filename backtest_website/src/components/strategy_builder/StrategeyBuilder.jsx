import { Button, Form, Input, Select, Space, Tooltip, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import './StrategeyBuilder.css'
import BacktestParams from './BacktestParams';
import PositionClose from './PositionClose';
import PositionOpen from './PositionOpen';
import moment from 'moment';
const dateFormat = 'YYYY/MM/DD';

export default function StrategeyBuilder(props) {

  const {formRef, form, initialValues} = props;

  const showInput = () => {
    console.log(form.getFieldsValue());
  }

  return (
    <div >
      <Form
        form={form}
        ref={formRef}
        className='backtest-strategy-form'
        name="complex-form"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        initialValues={ 
          {}
        }
      >
        <BacktestParams dateFormat={dateFormat} />
        <PositionOpen form={form} formRef={formRef} />
        <PositionClose form={form} formRef={formRef} />
      </Form>
    </div>

  );
}
