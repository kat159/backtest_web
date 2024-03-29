import React, { useState } from 'react'
import PubSub from 'pubsub-js';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import strategyService from '../../../../services/strategyService';
import StrategyTable from './StrategyTable';
import StrategeyBuilder from '../../../strategy_builder/StrategeyBuilder';
import { useRef } from 'react';
import { useForm } from 'antd/lib/form/Form';
import { Button, Space, Input, Popconfirm, Spin, message } from 'antd';
import moment from 'moment';
import { DATE_FORMAT } from '../../../../config/config';
import backtestService, { formDataToBackendFormat } from '../../../../services/backtestService';
import BacktestReport from '../../popup/BacktestReport/BacktestReport';
import criterionService from '../../../../services/criterionService';
import myArray from '../../../../utils/myArray';
import DraggablePoppup from '../../popup/DraggablePoppup';

export default function MyStrategies() {

  const [isCreatingCriterion, setIsCreatingCriterion] = useState(false);

  const [form] = useForm()
  const [strategyEditing, setStrategyEditing] = useState(undefined);

  const handleCreateFinish = () => {
    form.validateFields().then(
      values => {
        strategyService.addStrategy(values).then(
          res => {
            const result = res.data
            if (result.err_code === 0) {
              setIsCreatingCriterion(false);
              form.resetFields();
              retrieveData();
            } else if (result.message === 'Strategy Name Exists') {
              form.setFields([
                {
                  name: 'strategyName',
                  errors: ['Strategy Name Exists']
                }
              ])
            } else {
              alert('Unexpected error happened, add operation failed');
            }

          }
        )
      },
      err => {

      }
    )
  }
  const createCriteriaClick = () => {
    setIsCreatingCriterion(true);
  }

  const [strategyList, setStrategyList] = useState([]);
  useEffect(() => {
    retrieveData();
  }, []);

  const retrieveData = () => {
    strategyService.getAll().then(
      res => {
        setStrategyList(res.data.results);
      }
    )
  }

  const onDeleteButtonClick = (strategyId) => {
    return async () => {
      if (strategyId === 28) {
        message.error('Can not delete sample strategy of guest.')
      } else {
        const res = await strategyService.daleteStrategy(strategyId);
        retrieveData();
      }
    }
  }

  const onEditButtonClick = (strategy) => {
    return async () => {
      const values = strategyService.fromBackendFormat(strategy);
      const { closeCriteriaIdList, openCriteriaIdList } = values
      const filter = async (criterionId, index) => {          // 移除被删掉的criterion
        const res = await criterionService.getCriterionById(criterionId)
        return res.err_code === undefined || res.err_code === 0
      }
      values.closeCriteriaIdList = await myArray.filterAsync(closeCriteriaIdList, filter)
      values.openCriteriaIdList = await myArray.filterAsync(openCriteriaIdList, filter)
      setStrategyEditing(values);
      form.setFieldsValue(values);          // form=useForm()之后，这个form不会被父组件State影响,value只能手动重置
    }
  }
  const [showRunningTest, setShowRunningTest] = useState(false)
  const onRunTestButtonClick = (strategy) => {
    return async () => {
      setDisplayingReport(true)
      setShowRunningTest(true)
      let data = strategyService.fromBackendFormat(strategy);
      data = await backtestService.runTestWithFormData(data);
      setShowRunningTest(false)
      // console.log(data)
      setTestReport({ ...data.data, strategy: strategy });
    }
  }

  const handleEditFinish = async () => {
    if (strategyEditing.id === 28) {
      message.error('Can not change sample strategy of guest')
    } else {
      let values = await form.validateFields()
      const res = await strategyService.updateStrategy(strategyEditing.id, values)
      const result = res.data
      if (result.err_code === 0) {
        setStrategyEditing(undefined);
        form.resetFields();  // form实例不收父组件state影响，不会更新,必须手动重置
        retrieveData();
      } else if (result.message === 'Strategy Name Exists') {
        form.setFields([
          {
            name: 'strategyName',
            errors: ['Strategy Name Exists']
          }
        ])
      } else {
        alert('Unexpected error happened, update failed');
      }
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setStrategyEditing(undefined);
    setIsCreatingCriterion(false);
  }
  const [displayingReport, setDisplayingReport] = useState(false)
  const [testReport, setTestReport] = useState(undefined)

  const fetch = (value, callback) => {
    const fake = () => {
      const userId = localStorage.getItem('userId')
      strategyService.suggestAllWithName(userId, value).then(
        res => {
          const { results, err_code, } = res;
          console.log(results)
          callback(results);
        },
        err => {
        }
      )
    };
    fake();
  };
  const handleSearchNameChange = (e) => {
    const value = e.target.value
    setTimeout(
      () => {
        if (e.target.value === value) { // **把要搜过的value存在本地，300ms之后通过对比之前要搜索的内容和e.target当前的value对比，防止打字过程中的无效搜索
          fetch(e.target.value, setStrategyList);
        } else {
          // console.log('Searched value:', value, 'current value:', e.target.value, 'stop searching because value not match as type too fast')
        }
      }, 300
    )
  }
  const userId = localStorage.getItem('userId')
  const sampleStrategy = {
    timePeriod: [moment('2010/03/23', DATE_FORMAT), moment('2021/11/01', DATE_FORMAT)],
    positionType: 'Long',
    holdingDays: 5,
    capital: 1000000,
    capitalAtRisk: 20,
    commission: 0.02,
    bidAskSpread: 0.01,
    openCriteriaLogic: 'and',
    closeCriteriaLogic: 'and',
    openCriteriaIdList: userId === '7' ? [30] : undefined,
    closeCriteriaIdList: userId === '7' ? [31] : undefined
  }
  return (
    <div >
      {
        showRunningTest ? <Spin
          size='large'
          tip='Running Test...'
          style={{
            position: 'absolute',
            top: '30%',
            left: '30%'
          }}
        /> :
          testReport ?
            <BacktestReport
              testReport={testReport}
              setTestReport={setTestReport}
              setDisplayingReport={setDisplayingReport}
              visible={displayingReport}
            /> :
            strategyEditing ?
              <div className='backtest-builder-whole-page'>
                <Popconfirm
                  title='Current values will be overrided'
                  onConfirm={() => { form.setFieldsValue(sampleStrategy) }}
                >
                  <Button type='dashed' >Use Sample Strategy</Button>
                </Popconfirm>
                <StrategeyBuilder form={form} />
                <Space className='button-group-bottem' size={'large'} >
                  <Button onClick={handleEditFinish} >Finish</Button>
                  <Button onClick={handleCancel} >Cancel</Button>
                </Space>
              </div> :
              isCreatingCriterion ?
                <div className='backtest-builder-whole-page'>
                  <Popconfirm
                    title='Current values will be overrided'
                    onConfirm={() => { form.setFieldsValue(sampleStrategy) }}
                  >
                    <Button type='dashed' >Use Sample Strategy</Button>
                  </Popconfirm>
                  <StrategeyBuilder
                    form={form}
                    defaultValues={sampleStrategy}
                  />
                  <Space className='button-group-bottem' size={'large'} >
                    <Button onClick={handleCreateFinish} >Finish</Button>
                    <Button onClick={handleCancel} >Cancel</Button>
                  </Space>
                </div> :
                <div style={{ marginLeft: '20px' }}>
                  <Space style={{ marginBottom: '10px' }}>
                    <Button type='dashed' onClick={createCriteriaClick} >build strategy</Button>
                    <Input
                      placeholder='search by name'
                      onChange={handleSearchNameChange}
                    ></Input>
                  </Space>
                  <StrategyTable strategyList={strategyList} onRunTestButtonClick={onRunTestButtonClick} onDeleteButtonClick={onDeleteButtonClick} onEditButtonClick={onEditButtonClick} />
                </div>
      }

    </div>
  )
}
