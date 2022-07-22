import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Backtest from './Backtest/Backtest'
import BacktestLog from './BacktestLog/BacktestLog'
import MyCriteria from './MyCriteria/MyCriteria'
import MyStrategies from './MyStrategies/MyStrategies'
import './Content.css'

export default function Content() {
  return (
    <Routes >
        <Route path='backtest/*' element={<Backtest />} />
        <Route path='my_criteria/*' element={<MyCriteria />} />
        <Route path='my_strategies/*' element={<MyStrategies />} />
        <Route path='backtest_logs/*' element={<BacktestLog />} />
        <Route path='*' element={<Navigate to='/backtest' />} />
    </Routes>
  )
}
