import { CloseOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Rnd } from "react-rnd";
import StockChart from './StockChart';

export default function StockChartPopup(props) {
    const { handleForceClosingClick, content, title, mask, zIndexOfMask = 2, maskStyle, contentStyle, stockSymbol, testReport } = props
    const style = {

    };
    const defaultSize = {
        width: 800,
        height: 800,
    }
    const [outerSize, setOuterSize] = useState(defaultSize)
    const [stockChartResizeTimeout, setStockChartResizeTimeout] = useState(undefined)   // 起码间隔100ms resize一次
    const [stockChartLastResizeTimeout, setStockChartLastResizeTimeout] = useState(undefined)
    useEffect(() => {
        // 起码间隔25ms resize一次
        if (stockChartResizeTimeout) {
        } else {
            const timeout = setTimeout(() => {
                // stockChart是canvas，无法根据parent size进行动态resize，但是一旦window resize evemt发生，canvas就会根据parent重新resize
                // 所以resize要trigger window的resize event
                window.dispatchEvent(new Event('resize'))
                setStockChartResizeTimeout(undefined)
            }, 25)
            setStockChartResizeTimeout(timeout)
        }

        // 执行最后一次resize
        if (stockChartLastResizeTimeout) {
            clearTimeout(stockChartLastResizeTimeout)
        }
        const timeout = setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
            setStockChartLastResizeTimeout(undefined)
        }, 50)
        setStockChartLastResizeTimeout(timeout)
    }, [outerSize.width])

    // block the body from scrolling (or any other element)
    const chartRef = useRef(null)
    useEffect(() => {
        const cancelWheel = e => {
            // if (chartRef.current && chartRef.current.contains(e.target)) {
            //     console.log(111)
            // }
            // console.log(e.currentTarget, chartRef.current)
            chartRef.current && e.preventDefault()
        }
        document.addEventListener('wheel', cancelWheel, { passive: false })
        return () => document.removeEventListener('wheel', cancelWheel)
    }, [])

    return (
        <Rnd className='risizable-draggable-poppup-outer'
            ref={chartRef}
            style={{
                display: "block",
                // alignItems: "center",
                // justifyContent: "center",
                border: "solid 1px #ddd",
                zIndex: 2,
            }}
            default={{
                x: 50,
                y: 0,
                ...defaultSize
            }}
            minHeight={300}
            minWidth={300}
            dragHandleClassName='risizable-draggable-poppup-handle'
            onResize={(e, direction, ref, delta, position) => {
                setOuterSize({
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                setTimeout(
                    setOuterSize({
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                    }), 70)
            }}
        >
            <div className='risizable-draggable-poppup-handle' >
                &nbsp; {title}
                <CloseOutlined
                    onClick={handleForceClosingClick}
                    style={{
                        float: 'right',
                        marginTop: '4px',
                        marginRight: '3px',
                        ...contentStyle
                    }} />
            </div>
            <div className='my-stock-chart'
                style={{
                    width: outerSize.width
                }}
            >
                <StockChart
                    chartWidth={outerSize.width}
                    chartHeight={outerSize.height-40}
                    stockSymbol={stockSymbol}
                    testReport={testReport}
                />
            </div>

        </Rnd>

    )
}
