d = {
    a: 1,
    b: 2,
    c: 3,
}

formulas = ['a', 'b']

const s = formulas.map(formula => d[formula])
console.log(s)

    < Chart id = { 2} origin = {(w, h) => [0, h - 300]} height = { 80} yExtents = { d => [0, d.volume]} >
          <YAxis axisAt="right" orient="right" ticks={5} tickFormat={format(".2s")} />
          <XAxis axisAt="bottom" orient="bottom" showTicks={false} />
          <BarSeries yAccessor={d => d.volume} fill={(d) => d.close > d.open ? "#6BA583" : "red"} />
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")} />
        </Chart >

    <Chart id={3} origin={(w, h) => [0, h - 200]} height={80} yExtents={d => d.close}>
        <YAxis axisAt="right" orient="right" ticks={5} tickFormat={format(".2s")} />
        <XAxis axisAt="bottom" orient="bottom" showTicks={true} ticks={10} />
        <LineSeries
            yAccessor={d => d.close}
            stroke="#2ca02c" />
        <LineSeries
            yAccessor={d => d.open}
            stroke="#2ca02c" />
        <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")} />
        <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%Y-%m-%d")} />

        <SingleValueTooltip
            onClick={(e) => { console.log('click'); e.stopPropagation() }}
            yAccessor={d => d.close}
            yLabel={`BLJJ(1, 2, 1)`}
            yDisplayFormat={format(".2f")}
            /* valueStroke={atr14.stroke()} - optional prop */
            /* labelStroke="#4682B4" - optional prop */
            origin={[0, -5]} />
    </Chart>

{
    indicators.map((indicator, index) => {
        console.log(indicator)
        counter = 0; textSimulator = '';
        const { id: indicatorId, indicatorName, tickNum, tickDemical, variables, } = indicator
        const formulas = []
        for (const variable of variables) {
            formulas.push(variable.formula);
        }
        const indicatorNum = indicators.length
        const totalHeight = 300
        const topPadding = 20
        const heightForEach = (totalHeight - topPadding * indicatorNum) / indicatorNum
        const startDistanceToBottom = totalHeight
        const curDistanceToBottom = startDistanceToBottom - (20 + heightForEach) * index

        return <Chart id={index + 2}
            origin={(w, h) => [0, h - curDistanceToBottom]}
            height={heightForEach}
            yExtents={d => {
                const minY = Math.min(...formulas.map(formula => d[formula]))
                const maxY = Math.max(...formulas.map(formula => d[formula]))

                if (formulas.length > 1) {
                    console.log(data, typeof data, typeof [0.01], typeof data[0], typeof -0.01)
                    console.log(minY + ' -> ' + maxY)
                }
                return [minY, maxY]
            }}
        >
            <YAxis axisAt="right" orient="right" ticks={tickNum} tickFormat={format("." + tickDemical + "s")} />
            <XAxis axisAt="bottom" orient="bottom" showTicks={false} />
            <MouseCoordinateY
                at="right"
                orient="right"
                displayFormat={format("." + tickDemical + "s")} />
            {   // Line / Bar Series
                variables.map((variable, index) => {
                    const { name, formula, type, color, colorSelector } = variable
                    return type === 'Bar' ?
                        <BarSeries
                            yAccessor={d => d[formula]}
                            fill={colorSelector}
                        /> :
                        <LineSeries
                            yAccessor={d => d[formula]}
                            stroke={color} />
                })
            }

            {
                variables.map((variable, index) => {
                    const { name, formula, type, color, colorSelector, vairableTickDemical } = variable

                    const indent = -23 + (
                        pixelWitdh(
                            textSimulator.slice(0, textSimulator.length),
                            { size: 11 }
                        ) +
                        pixelWitdh(
                            ' L0.' + (new Array(vairableTickDemical ?? tickDemical).fill(0).join('')),
                            { size: 11 }
                        ) * index +
                        (index === 0 ? 0 : pixelWitdh('Edit ', { size: 11 }))
                    ) * 1

                    counter += name.length
                    textSimulator += name

                    return <SingleValueTooltip
                        onClick={(e) => {
                            if (index === 0) {
                                // onEditClick(indicatorId);
                            }
                            e.stopPropagation()
                        }}
                        yAccessor={d => d[formula]}
                        yLabel={(index === 0 ? 'Edit ' : '') + name}
                        yDisplayFormat={format("." + (vairableTickDemical ?? tickDemical) + "f")}
                        /* valueStroke={atr14.stroke()} - optional prop */
                        /* labelStroke="#4682B4" - optional prop */
                        origin={[
                            // -25 + (
                            //   counter - name.length +
                            //   (2 + (1.5 + vairableTickDemical ?? tickDemical) * 0.8) * index + 
                            //   (index === 0 ? 0 : 3)
                            // ) * 7,
                            indent,
                            - 5,
                        ]}
                    />
                })
            }

            { // Y轴Date底角注释
                index === indicators.length - 1 &&
                <MouseCoordinateX
                    at="bottom"
                    orient="bottom"
                    displayFormat={timeFormat("%Y-%m-%d")}
                />
            }

        </Chart>
    })
}