import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { formatZipcode } from "../helpers/formatter";
import AnalysisTextGenerator from "../helpers/analysisTextGenerators";
import React from "react";
const config = require('../config.json');



export async function analysisLoader(props) {

  console.log(`Loading: ${JSON.stringify(props.request.url)}`)

  const url = new URL(props.request.url)
  const params = url.searchParams

  const zipcode = params.get('zipcode')

  if (!zipcode) {
    return {data: null, error: 'No zipcode provided'}
  }

  const urlIsInvalid =
    !zipcode ||
    zipcode.length !== 5 ||
    Number.isNaN(+zipcode)

  if (urlIsInvalid) {
    console.error(`Query is invalid: ${JSON.stringify(params)}`)
    return null
  }

  const parsedZipcode = Number.parseInt(zipcode)

  const incomeResult = await fetch(`http://${config.server_host}:${config.server_port}/income/by-zip?zipcode=${zipcode}`)
  if (incomeResult.status !== 200) {
    console.log('Failed to get income results')
    return null
  }
  const incomeData = await incomeResult.json()

  const populationResult = await fetch(`http://${config.server_host}:${config.server_port}/population?zipcode=${zipcode}`)
  if (populationResult.status !== 200) {
    console.log('failed to get population results')
    return null
  }
  const populationData = await populationResult.json()

  const michelinRestaurantsResult = await fetch(`http://${config.server_host}:${config.server_port}/restaurants/michelin-star?zipcode=${zipcode}`)
  if (michelinRestaurantsResult.status !== 200) {
    console.log('Failed to get michelin star results')
    return null
  }
  const michelinRestaurants = await michelinRestaurantsResult.json()

  const fastFoodRestaurantsResult = await fetch(`http://${config.server_host}:${config.server_port}/restaurants/fast-food?zipcode=${zipcode}`)
  if (fastFoodRestaurantsResult.status !== 200) {
    console.log('Failed to get fast food results')
    return null
  }
  const fastFoodRestaurants = await fastFoodRestaurantsResult.json()

  const totalRestaurantsInZipcodeResult = await fetch(`http://${config.server_host}:${config.server_port}/restaurants-in-zipcode?zipcode=${zipcode}`)
  if (totalRestaurantsInZipcodeResult.status !== 200) {
    console.log('Failed to get total restaurants results.')
    return null
  }
  const totalRestaurantsInZipCode = await totalRestaurantsInZipcodeResult.json()

  const totalRestaurantsResult = await fetch(`http://${config.server_host}:${config.server_port}/restaurants?zipcode=${zipcode}`)
  if (totalRestaurantsResult.status !== 200) {
    console.log('Failed to get total restaurants results.')
    return null
  }
  const totalRestaurants = await totalRestaurantsResult.json()

  return { ...incomeData, michelinRestaurants, fastFoodRestaurants, totalRestaurants, totalRestaurantsInZipCode, population: populationData.numPeople, query: { zipcode: parsedZipcode }, error: null }
}


export default function AnalysisPage() {

  const data = useLoaderData()
  const navigate = useNavigate()

  useEffect(() => {
    if (data && data.error) {
      navigate('/analyze/home')
      return
    }
  }, [])
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

  if (data.error) {
    return null
  }


  const zipcode = formatZipcode(data.query.zipcode)
  const averageIncome = 52517.07489561993
  const incomeNum = Number(data.averageIncome)
  const population = Number(data.population)
  const averagePopulation = 118123.883775

  const generator = new AnalysisTextGenerator(zipcode, incomeNum, averageIncome, population, data.michelinRestaurants, data.fastFoodRestaurants, averagePopulation, data.totalRestaurantsInZipCode, data.totalRestaurants)

  return (
    <div className="scroll-container">
      <section>
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
      {generator.generateIncomePerRestaurantText()}
      {generator.generateTotalRestaurantsText()}
      {generator.generateFinalText()}
    </div>

  )
}