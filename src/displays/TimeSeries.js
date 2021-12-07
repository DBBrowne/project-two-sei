import React from 'react'
// import { VictoryLine, VictoryChart, VictoryAxis } from 'victory'
import { XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, ChartLabel } from 'react-vis'
import { getTimeSeriesData } from '../lib/utils'

const numberOfDateTicks = 4

function TimeSeries() {
  const [chartData, setChartData] = React.useState([])
  const tickValues = []

  React.useEffect(() => {
    (async () => {
      setChartData(
        await getTimeSeriesData()
      )
    })()
  }, [])


  if (chartData.length) {
    const tickDateAddition = ((
      chartData[chartData.length - 1].x - chartData[0].x) / (numberOfDateTicks)
    )
    const initialDateValue = chartData[0].x
    for (let i = 0; i < numberOfDateTicks; i++) {
      tickValues.push(initialDateValue + (i * tickDateAddition))
    }
  }

  console.log('ticks:', tickValues)
  console.log('chartData:', chartData)
  return (
    <section className="section">
      <div className="columns is-centered">
        <div className="column is-three-quarters has-background-light">
          {chartData.length && (
            <>
              <h3>Coin 1/Coin 2</h3>
              <figure className="is-flex is-justify-content-center">
                <XYPlot
                  margin={{ bottom: 75 }}
                  width={600}
                  height={300}
                // title='this is a test'
                >
                  {/* <HorizontalGridLines /> */}
                  <LineSeries
                    color="blue"
                    data={chartData.reverse()} />
                  <XAxis

                    tickFormat={x => ((new Date(x * 1000)).toLocaleDateString())}
                    tickLabelAngle={-90}
                  />
                  <YAxis />
                </XYPlot>
              </figure>
            </>
          )}
          {/* <VictoryChart>
            <VictoryAxis
              tickValues={tickValues}
              tickFormat={x => ((new Date(x * 1000)).toLocaleDateString())}
            >
            </VictoryAxis>
            <VictoryAxis dependentAxis
              tickCount={10}
            >
            </VictoryAxis>
            <VictoryLine
              style={{
                // data: { stroke: "#c43a31" },
                parent: { border: '1px solid #ccc' },
              }}
              data={chartData}
            />
          </VictoryChart> */}
        </div>
      </div>
    </section>
  )
}

export default TimeSeries