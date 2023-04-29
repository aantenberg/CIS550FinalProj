import { useLoaderData } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { formatZipcode } from "../helpers/formatter";
import AnalysisTextGenerator from "../helpers/analysisTextGenerators";
const config = require('../config.json');

export async function analysisLoader(props) {

  console.log(`Loading: ${JSON.stringify(props.request.url)}`)

  const url = new URL(props.request.url)
  const params = url.searchParams

  const zipcode = params.get('zipcode')

  const urlIsInvalid =
    !zipcode ||
    zipcode.length !== 5 ||
    Number.isNaN(+zipcode)

  if (urlIsInvalid) {
    console.error(`Query is invalid: ${JSON.stringify(params)}`)
    return null
  }

  const parsedZipcode = Number.parseInt(zipcode)

  // TODO: Fetch all the data needed for analysis, and HANDLE ERRORS
  const incomeResult = await fetch(`http://${config.server_host}:${config.server_port}/income?zipcode=${zipcode}`)
  if (incomeResult.status !== 200) {
    console.log('Failed to get income results')
    return {}
  }
  const incomeData = await incomeResult.json()

  const populationResult = await fetch(`http://${config.server_host}:${config.server_port}/population?zipcode=${zipcode}`)
  if (populationResult.status !== 200) {
    console.log('failed to get population results')
    return {}
  }
  const populationData = await populationResult.json()
  return { ...incomeData, michelinRestaurants: [], fastFoodRestaurants: [], population: populationData.numPeople, query: { zipcode: parsedZipcode } }
}


export default function AnalysisPage() {

  const data = useLoaderData()

  if (!data) {
    return <p>Query is invalid</p>
  }
  const zipcode = formatZipcode(data.query.zipcode)
  const averageIncome = 52517.07489561993
  const incomeNum = Number(data.averageIncome)
  const population = Number(data.population)

  const generator = new AnalysisTextGenerator(zipcode, incomeNum, averageIncome, population, data.michelinRestaurants, data.fastFoodRestaurants)

  const chartData = [
    {
      name: zipcode,
      val: incomeNum,
    },
    {
      name: 'Average',
      val: averageIncome,
    },
  ]

  return (
    <div className="scroll-container">
      <section className="one">
        <div style={{ width: '70%' }}>
          <img src={require('../assets/hungertap.webp')} alt="hungerbot" width={200} style={{ marginBottom: -5 }} />
          <div className="center-text bordered-card">
            <h1 style={{ fontSize: 84 }}>An Analysis of {zipcode}</h1>
            <h2 style={{ fontSize: 40 }}>Written by HUNG3RBOT</h2>
          </div>
        </div>
      </section>
      <section className="two">
        <div style={{ display: 'flex', gap: 50, width: '80%', alignItems: 'center' }}>
          <div className="bordered-card">
            <h1 className="emoji-icon">💵</h1>
            {generator.generateIncomeAnalysisText()}
          </div>
          <BarChart
            width={350}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            style={{
              backgroundColor: 'var(--panel-color)', borderWidth: 5, borderRadius: 20, padding: '40px 10px', zIndex: 1
            }}
          >
            <Bar dataKey="val" fill="var(--theme-main)" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={tick => tick.toLocaleString()} />
          </BarChart>
        </div>
      </section>
      <section className="three">
        <div style={{ display: 'flex', gap: 50, width: '80%', alignItems: 'center' }}>
          <div>
            <img src={require('../assets/hungerspeak.gif')} alt="hungerbot" width={300} />
            <hr style={{ height: 1, border: 'none', backgroundColor: 'var(--black)', boxShadow: '0px 4px 5px 0px white', marginTop: -6 }} />
          </div>
          <div className="bordered-card">
            <h1 className="emoji-icon">👥</h1>
            {generator.generatePopulationText()}
          </div>
        </div>
      </section>
      <section className="four">
        <div style={{ width: '70%' }}>
          <div style={{ backgroundColor: 'var(--panel-color)', borderRadius: 20, padding: 30, border: 'solid', borderColor: 'white', borderWidth: 5 }}>
            <h1 className="emoji-icon">⭐</h1>
            {generator.generateMichelinStarText()}
          </div>
        </div>
      </section>
    </div>

  )
}