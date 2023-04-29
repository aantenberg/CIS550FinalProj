import { useLoaderData } from "react-router-dom";
import { formatZipcode } from "../helpers/formatter";
import AnalysisTextGenerator from "../helpers/analysisTextGenerators";
import React from "react";
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
  const incomeResult = await fetch(`http://${config.server_host}:${config.server_port}/income/by-zip?zipcode=${zipcode}`)
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

  const michelinRestaurantsResult = await fetch(`http://${config.server_host}:${config.server_port}/restaurants/michelin-star?zipcode=${zipcode}`)
  if (michelinRestaurantsResult.status !== 200) {
    console.log('Failed to get michelin star results')
    return {}
  }
  const michelinRestaurants = await michelinRestaurantsResult.json()

  const fastFoodRestaurantsResult = await fetch(`http://${config.server_host}:${config.server_port}/restaurants/fast-food?zipcode=${zipcode}`)
  if (fastFoodRestaurantsResult.status !== 200) {
    console.log('Failed to get fast food results')
    return {}
  }
  const fastFoodRestaurants = await fastFoodRestaurantsResult.json()

  return { ...incomeData, michelinRestaurants, fastFoodRestaurants, population: populationData.numPeople, query: { zipcode: parsedZipcode } }
}


export default function AnalysisPage() {

  const data = useLoaderData()

  if (!data) {
    return (
      <div className="center-text">
        <h1 style={{ fontSize: 72 }}>Uh Oh...</h1>
        <div>
          <img src={require('../assets/hungertap.webp')} alt="hungerbot" width={200} style={{ marginBottom: -5 }} />
          <h2>That zipcode's invalid. Please <a style={{ color: 'var(--white)' }} className="underline-animated" href="/analyze/home">try another zipcode.</a></h2>
        </div>
      </div>
    )
  }
  const zipcode = formatZipcode(data.query.zipcode)
  const averageIncome = 52517.07489561993
  const incomeNum = Number(data.averageIncome)
  const population = Number(data.population)
  const averagePopulation = 118123.883775

  const generator = new AnalysisTextGenerator(zipcode, incomeNum, averageIncome, population, data.michelinRestaurants, data.fastFoodRestaurants, averagePopulation)

  return (
    <div className="scroll-container">
      <section className="one">
        <div style={{ width: '70%' }}>
          <img src={require('../assets/hungertap.webp')} alt="hungerbot" width={200} style={{ marginBottom: -5 }} />
          <div className="center-text bordered-card">
            <h1 style={{ fontSize: 84 }}>An Analysis of {zipcode}</h1>
            <h2 style={{ fontSize: 40 }}>Written by HUNG3RB0T</h2>
          </div>
        </div>
      </section>
      {generator.generateIncomeAnalysisText()}
      {generator.generatePopulationText()}
      {generator.generateMichelinStarText()}
      {generator.generateFastFoodText()}
    </div>

  )
}