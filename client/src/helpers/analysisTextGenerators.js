import { dollarFormat, formatZipcode } from "./formatter"

export default class AnalysisTextGenerator {
  constructor(zipcode, income, averageIncome, population, michelinRestaurants, fastFoodRestaurants, averageZipPopulation = 10000) {
    this.zipcode = formatZipcode(zipcode)
    this.income = income
    this.averageIncome = averageIncome
    this.population = population
    this.michelinRestaurants = michelinRestaurants
    this.fastFoodRestaurants = fastFoodRestaurants
    this.averageZipPopulation = averageZipPopulation
  }

  generateIncomeAnalysisText(differenceThreshold = 10000) {
    const incomeDiff = this.income - this.averageIncome
    const color = incomeDiff > 0 ? 'green' : 'red'
    let textBeforeNumber = ` has an average income per capita of ${dollarFormat(this.income)}. `
    if (incomeDiff > differenceThreshold) {
      textBeforeNumber += 'Woah! '
    }
    textBeforeNumber += `That's `
    const numberText = incomeDiff > 0 ? `${dollarFormat(incomeDiff)} higher` : `${dollarFormat(incomeDiff * -1)} lower`
    const textAfter = ' than the national average.'
    return (<p className="card-text"><b>{this.zipcode}</b>{textBeforeNumber}<span style={{ color }}>{numberText}</span>{textAfter}</p>)
  }

  generatePopulationText(populationDifferenceThreshold = 5000) {
    let textBeforeZip = `With a population of ${this.population.toLocaleString()} people,`
    let textAfterZip = ''
    if (this.population - this.averageZipPopulation > populationDifferenceThreshold) {
      textAfterZip += `is highly populated, and `
    } else if (this.population > this.averageZipPopulation) {
      textAfterZip += `is fairly populous, and `
    }
    textAfterZip += 'could use some delicious restaurants!'
    return (<p className="card-text"> {textBeforeZip} <b>{this.zipcode}</b> {textAfterZip}</p>)
  }

  generateMichelinStarText(threshold = 3) {
    let numMichelinStar = this.michelinRestaurants.length
    let michelinCountStr = numMichelinStar > 0 ? numMichelinStar : 'no'
    let analysisString = '';
    if (numMichelinStar < threshold) {
      if (this.income > this.averageIncome) {
        analysisString = 'With an above average income, this could be a great place for an aspiring restauranteur to open up a high end restaurant!'
      } else {
        analysisString = 'This may be a result of the below average income level.'
      }
    } else {
      if (this.income > this.averageIncome) {
        analysisString = 'This may be a result of the above average income level.'
      } else {
        analysisString = 'This is surprising, as the income level is below average.'
      }
    }
    return (
      <div className='speech-bubble'>
        <p className="card-text">{`There are ${michelinCountStr} Michelin Star rated restaurants within 20 miles of ${this.zipcode}. ${analysisString}`}</p>
      </div>
    )
  }
}