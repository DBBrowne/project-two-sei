# CompCoin
Spot and time series cryptocurrency pair valuations.
React + Axios demo project

Deployed at [compcoin.dbb.tools](https://compcoin.dbb.tools) via heroku.


## Contents
- [Usage](#usage)
- [Getting Started](#getting-started)
- [Project History](#project-history)
    - [Brief](#brief)
    - [Planning](#planning)
    - [Execution and Lessons Learned](#execution-and-lessons-learned)
- [Issues and ToDos](#issues-and-todos)
- [Built with](#built-with)
- [Team Members](#team-members)

## Usage
|Single pair|Multi-pair comparison|
|---|---|
|Spot conversion rate and time series valuation for a coin pair.|View time-series comparisons with a number of significant cryptocurrencies.|
|Visit `/convert`, enter the amount for conversion, and select the base and quote token.|Visit `/convert/<ticker>` or hover the **Coin Detail** dropdown from the nav bar, then select the base currency of choice.|
|![CompCoin Single Pair view](https://user-images.githubusercontent.com/72463218/154111327-1f1ec2d3-facd-47d5-b691-5c1638fb7d6f.png)|![Compcoin Multi-pair view](https://user-images.githubusercontent.com/72463218/154111244-041d772d-7a09-4f9d-b732-3d346111d356.png) |

## Getting Started
These instructions will run a copy of the project on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.
#### Prerequisites
` node ^16`
#### Installing
Install dependencies with npm:
```console
:<repo-root>$ npm i
```
#### Running Locally
No environment variables are necessary.
Run with:
```console
:<repo-root>$ npm run dev
```
`npm run dev` defaults to port 3000. To specify a local port:
```console
:<repo-root>$ PORT=<port> npm run dev
```

#### Deployment
build to `/build/` :
```console
:<repo-root>$ npm run build
```
To deploy with netlify:
```console
:<repo-root>$ netlify deploy --dir=build
```

## Project History

### Brief
Consume a public API, build a multi-component react app to process and display data form that API to a user.  
**Timeframe**: Two days.

### Planning
Investigate potential data sources, design iterable wireframes in Miro.  Settle on an xe.com style layout with data from Coinbase.
|CompCoin UI research|CompCoin wireframe MVP|CompCoin V2|
|---|---|---|
|![GA_Project2 - CompCoin UI research](https://user-images.githubusercontent.com/72463218/154285392-708c17ac-f792-48eb-b201-8de09932a6c5.jpg)|![GA_Project2 - CompCoin wireframe MVP](https://user-images.githubusercontent.com/72463218/154285714-240755d6-491e-4fe3-bcb5-ff1ae6d4104a.jpg)|![GA_Project2 - CompCoin V2](https://user-images.githubusercontent.com/72463218/154285723-b5d5b93d-2401-4b2e-8d4d-1c7f5f1aa3a3.jpg)|

Basic project plan, targeting highest value issues first, followed by highest risk, followed by *nice-to-have*s:
1. Confirm API route to gather spot rates.
1. Build basic layout with React Router and reusable components.
1. Gather time series data.
1. Chart time series data.
1. Re-use time series data components to offer comparison from one base to a variety of quoted tokens.
### Execution and Lessons Learned
1. Spot rates from Coinbase:
    - [Paramaterized api call](https://github.com/DBBrowne/project-two-sei/blob/dad83208c45aa7a0d4cc5615ba41021b1d7b20f7/src/lib/api.js#L3-L8)
    - [Simultaneous asynchronous fetches](https://github.com/DBBrowne/project-two-sei/blob/main/src/lib/utils.js#L4-L23):
      ```javascript
      export async function getExchangeRate({ original, target }) {
        // get conversion to USD for original and target
        const [originalUSDConversion, targetUSDConversion] = await Promise.all(
          [original, target].map(ticker => (
            getCurrencyData(ticker).then(
              res => parseFloat(res.data.data.amount)
            )
          ))
        )

        // calculate direct conversion rate
        const finalExchangeRate = originalUSDConversion / targetUSDConversion

        ...
      }
      ```
1. [React Router](https://github.com/DBBrowne/project-two-sei/blob/f343e27934538ee2683a6994247e017ca5f737f6/src/App.js#L13-L26) and basic layout.
    - Retain a Nav component across the site whilst replacing the site content components.  
    - Simple Loading and Error message components, keeping users informed during delayed or failed request with simple reusable code, eg [TimeSeries.js](https://github.com/DBBrowne/project-two-sei/blob/main/src/displays/TimeSeries.js#L70-L94):
      ```javascript
      function ReactComponent () {
        const [isError, setIsError] = React.useState(false)
        const isLoading = !isError && !asyncContent

        return (
          <>
            {isLoading && <Loading />}
            {!isError && (
              <HappyPathPageContent content={asyncContent}/>
            )}
          </>
        )
      }
      ```
    
1. Gather time series data via parameterized API call with defaults:
    - [Fetch the time series data](https://github.com/DBBrowne/project-two-sei/blob/main/src/lib/api.js#L10-L14)
    - [Process the data](https://github.com/DBBrowne/project-two-sei/blob/main/src/lib/utils.js#L25-L66)  

        > This format of separating the steps into their own functions allows refactoring or changing providers behind each boundary, without needing to change downstream components.

1. Chart time-series data

    - [Show the data](https://github.com/DBBrowne/project-two-sei/blob/38b7bba8b79937602ecd8efddd5200c3c7a2185a/src/lib/utils.js#L25-L66)
        > Initially used [Victory](https://formidable.com/open-source/victory/), which provided excellent responsive charting components, however we were unable to format the axes and labels to meet our requirements.

        > We moved to [React-vis](uber.github.io/react-vis/) which supported the labelling and range control that we needed, however was not natively responsive.  This was solved with a [React Effect hook and window resize listener(https://github.com/DBBrowne/project-two-sei/blob/main/src/displays/TimeSeries.js#L23-L42)]:
        ```javascript
        function TimeSeries({ inputData }){
          // ...
          const graphContainerRef = React.useRef(null)
    
          React.useEffect(() => {
            function handleResize() {
              const newGraphWidth = graphContainerRef.current ? (
                graphContainerRef.current.offsetWidth * graphWidthPortionOfContainer
              ) : 600 // default size for mount
              setGraphDimensions({
                width: newGraphWidth,
                height: graphHeight(newGraphWidth),
              })
            }
            
            handleResize()
            window.addEventListener('resize', handleResize)

            return () => window.removeEventListener('resize', handleResize)
          },[])

          // ...
          return(
            <h3 ref={graphContainerRef} className="has-text-centered">
            /...
            <XYPlot
              //...
              width={graphDimensions.width}
              height={graphDimensions.height}
            >
              /...
            </XYPlot>
          )
        }
        ```
1. Re-use time series data components to offer comparison from one base to a variety of quoted tokens.
    - Once we have a reliable charting component, we can simply reuse that to offer comparative data between multiple token pairs:
      ```javascript
      function CoinDetail(){

        // ...

        return (
          <>
            <TimeSeries inputData={dataSeries1} />
            <TimeSeries inputData={dataSeries2} />
            <TimeSeries inputData={dataSeries3} />
          </>
        )
      }
      ```

## Issues and ToDos
 - **Unhappy Wrapper** - combine error and loading into single react component to accept error/loading state as parameters and wrap the happy path.
 - **Chart Y-Axis Scaling** - at extreme ranges, the Y scaling of teh charting component fails, and the line extends off the chart.  We saw this during development, and believed that we had addressed it by [setting the domain and margins](https://github.com/DBBrowne/project-two-sei/blob/main/src/displays/TimeSeries.js#L76-L77), however the issue has resurfaced.  Further investigation is required.
    ```jsx
    <XYPlot
      yDomain={[chartData.minValue * 0.85, chartData.maxValue * 1.25]}
      margin={{ bottom: 75, left: 75 }}
      // ...
    >
    ```

 ![Chart Component scaling failure](https://user-images.githubusercontent.com/72463218/154364867-8e98597e-57fe-4408-9a79-75206c6b6a79.png)
## Built With
- [Create React App](https://github.com/facebook/create-react-app)
- [Axios](https://npmjs.com/package/axios)
- [React-Vis](https://uber.github.io/react-vis/)
- [Bulma css framework](https://bulma.io)
- [SASS](https://sass-lang.com/)
- [dayjs](https://www.npmjs.com/package/dayjs)

## Team Members
- [tigeryant](https://github.com/tigeryant)
- [Duncan Browne](https://github.com/dbbrowne)
