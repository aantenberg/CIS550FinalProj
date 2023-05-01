import { dollarFormat, formatZipcode, formatWholeNumber } from "./formatter"
import { BarChart, Bar, XAxis, YAxis } from "recharts"

import React from 'react';

import { useEffect, useState, useRef } from 'react';

const useOnScreen = ref => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    });

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isIntersecting;
};

const AnimatedBold = ({ children }) => {
  const ref = useRef(null)
  const isVisible = useOnScreen(ref)
  return (<span ref={ref}>
    {isVisible ? <b className="highlight-animated-active">{children}</b> : <b>{children}</b>}
  </span>)
}

const AnimatedChart = ({ chartData }) => {

  const ref = useRef(null);
  const isVisible = useOnScreen(ref)

  return (
    <div ref={ref}>
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
        <Bar dataKey="val" fill="var(--theme-main)" isAnimationActive={isVisible} animationDuration={500} animationEasing="ease-out" animationBegin={200} />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={tick => tick.toLocaleString()} />
      </BarChart>
    </div>
  )
}


export default class AnalysisTextGenerator {
  constructor(zipcode, income, averageIncome, population, michelinRestaurants, fastFoodRestaurants, averageZipPopulation, allRestaurantsInZipCode, allRestaurants) {
    this.zipcode = formatZipcode(zipcode)
    this.income = income
    this.averageIncome = averageIncome
    this.population = population
    this.michelinRestaurants = michelinRestaurants
    this.fastFoodRestaurants = fastFoodRestaurants
    this.averageZipPopulation = averageZipPopulation
    this.allRestaurantsInZipCode = allRestaurantsInZipCode
    this.allRestaurants = allRestaurants
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

    const chartData = [
      {
        name: this.zipcode,
        val: this.income,
      },
      {
        name: 'Average',
        val: this.averageIncome,
      },
    ]
    return (
      <section>
        <div style={{ display: 'flex', gap: 50, width: '80%', alignItems: 'center' }}>
          <div className="bordered-card">
            <h1 className="emoji-icon">💵</h1>
            <p className="card-text"><b>{this.zipcode}</b>{textBeforeNumber}<span style={{ color }}>{numberText}</span>{textAfter}</p>
          </div>
          <AnimatedChart chartData={chartData} />
        </div>
      </section>)
  }

  generatePopulationText(populationDifferenceThreshold = 5000) {

    let textAfterZip = '. This area '
    if (this.population - this.averageZipPopulation > populationDifferenceThreshold) {
      textAfterZip += `is highly populated, and `
    } else if (this.population > this.averageZipPopulation) {
      textAfterZip += `is fairly populous, and `
    }
    textAfterZip += 'could use some delicious restaurants!'
    return (
      <section>
        <div className="bordered-card" style={{ width: '70%' }}>
          <h1 className="emoji-icon">👥</h1>
          <p className="card-text"><AnimatedBold>{this.population.toLocaleString()}</AnimatedBold> people live within 20 miles of <b>{this.zipcode}</b>{textAfterZip}</p>
        </div>
      </section>)
  }

  generateMichelinStarText(threshold = 3) {
    let numMichelinStar = this.michelinRestaurants.length
    let michelinCountStr = numMichelinStar > 0 ? numMichelinStar.toLocaleString() : 'no'
    let analysisString = '';
    let restaurantListText = ''
    if (numMichelinStar > 0) {
      const perCapita = this.population / numMichelinStar
      const perCapitaStr = formatWholeNumber(perCapita)
      analysisString += `That's about 1 Michelin Star rated restaurant for every ${perCapitaStr} people in the area! `
    }
    if (numMichelinStar < threshold) {
      // Not many michelin star restaurants
      if (this.income > this.averageIncome) {
        analysisString += 'With an above average income, this could be a great place for an aspiring restauranteur to open up a high end restaurant!'
      } else {
        analysisString += 'This may be a result of the below average income level.'
        if (this.population > this.averageZipPopulation) {
          analysisString += ' But with such a large population, it may still be a great place for an aspring restauranteur to open up a high end restaurant!'
        }
      }
    } else {
      // Many michelin star restaurants
      restaurantListText += `, including ${this.michelinRestaurants[0].name}, ${this.michelinRestaurants[1].name}, and ${this.michelinRestaurants[2].name}`
      if (this.income > this.averageIncome) {
        analysisString += 'It is likely that there are so many high end restaurants as a result of the above average income level.'
      } else {
        analysisString += 'It is suprising that there are so many high end restaurants, as the income level is below average.'
      }
    }
    return (
      <section>
        <div style={{ width: '70%', display: 'flex', alignItems: 'center' }}>
          <div className='speech-bubble-right' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontSize: 30 }}>There are <b>{michelinCountStr}</b> Michelin Star rated restaurants within 20 miles of {this.zipcode}{restaurantListText}. {analysisString}</p>
          </div>
          <img src={require('../assets/hungerspeak.gif')} alt="hungerbot" width={300} height={300} />
        </div>
      </section>
    )
  }

  generateFastFoodText(perRestaurantThreshold = 2000) {
    const numFastFood = this.fastFoodRestaurants.length
    const fastFoodCountStr = numFastFood > 0 ? numFastFood.toLocaleString() : 'no'
    let perRestaurant = perRestaurantThreshold

    let analysisString = '';
    if (numFastFood > 0) {
      perRestaurant = this.population / numFastFood
      const perRestaurantStr = formatWholeNumber(perRestaurant)
      analysisString += `That's about 1 fast food restaurant for every ${perRestaurantStr} people in the area. `
    }
    if (perRestaurant > perRestaurantThreshold) {
      // Not many fast food restaurants
      if (this.income > this.averageIncome) {
        analysisString += "Because the income level is above average, there aren't relatively many fast food restaurants in the area."
      } else {
        analysisString += 'With a below average income, this could be a good place for more affordable food options to open up!'
      }
    } else {
      // Many fast food restaurants
      if (this.income > this.averageIncome) {
        analysisString += 'This area has an above average income, so it may be surprising that there are so many fast food restaurants. But everyone loves a bit of fast food!'
      } else {
        analysisString += 'With a below average income, it is good that there are affordable food options in the area.'
      }
    }
    return (
      <section>
        <div className="bordered-card" style={{ width: '70%' }}>
          <h1 className="emoji-icon">🍔</h1>
          <p className="card-text">There are <AnimatedBold>{fastFoodCountStr}</AnimatedBold> fast food restaurant locations within 20 miles of {this.zipcode}. {analysisString}</p>
        </div>
      </section>
    )
  }

  generateTotalRestaurantsText() {
    let conclusionText = `All in all, ${this.zipcode} `
    if (this.income > this.averageIncome) {
      conclusionText += `has a high income, making it a great market for new restaurants of any kind.`
    } else {
      conclusionText += `has a below average income, making it a good market for affordable restaurant options.`
    }
    return (<section>
      <div style={{ width: '80%', display: 'flex', alignItems: 'center' }}>
        <img src={require('../assets/hungerdance.webp')} alt="hungerbot dancing!" width={300} height={300} />
        <div className="bordered-card" style={{ width: '70%' }}>
          <h1 className="emoji-icon">🍝</h1>
          <p className="card-text">In total, there are <AnimatedBold>{formatWholeNumber(this.allRestaurantsInZipCode.length)}</AnimatedBold> restaurants currently within {this.zipcode}, and more in the surrounding areas. {conclusionText}</p>
        </div>
      </div>
    </section>)
  }

  generateIncomePerRestaurantText(nationalAverage = 11592640) {
    const valueForZipCode = this.population * this.averageIncome / this.allRestaurants.length
    let analysisText = ''
    if (valueForZipCode > nationalAverage) {
      analysisText = "This means that the market is undersaturated - there is more money to be spent on food, so there's an opening for a new entrant!"
    } else {
      analysisText = "This means that the market is oversaturated - there's not enough money to go around for all the restaurants in the area!"
    }
    return (
      <section>
        <div className="bordered-card" style={{width: '70%'}}>
          <h1 className="emoji-icon">💰</h1>
          <p className="card-text">On average in the U.S, there are about {dollarFormat(nationalAverage)} of income for each restaurant. In {this.zipcode}, there are about <AnimatedBold>{dollarFormat(valueForZipCode)}</AnimatedBold> of income per restaurant in the area. {analysisText}</p>
        </div>
      </section>
    )
  }

  generateFinalText() {
    return (
      <section>
        <div style={{ width: '70%', display: 'flex', alignItems: 'center' }}>
          <img src={require('../assets/hungerbot.gif')} alt="hungerbot" width={300} height={300} />
          <div className='speech-bubble' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontSize: 30 }}>It has been an absolute pleasure to serve you today! If you'd like to analyze another zip code, click <a style={{ color: 'white' }} href="/analyze/home">here</a>. Happy exploring!</p>
          </div>
        </div>
      </section>
    )

  }
}