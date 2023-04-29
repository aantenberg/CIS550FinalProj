import { dollarFormat, formatZipcode } from "./formatter"
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
  constructor(zipcode, income, averageIncome, population, michelinRestaurants, fastFoodRestaurants, averageZipPopulation) {
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
    let textBeforeZip = `${this.population.toLocaleString()} people live within 20 miles of `
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
          <p className="card-text"> {textBeforeZip}<b>{this.zipcode}</b>{textAfterZip}</p>
        </div>
      </section>)
  }

  generateMichelinStarText(threshold = 3) {
    let numMichelinStar = this.michelinRestaurants.length
    let michelinCountStr = numMichelinStar > 0 ? numMichelinStar.toLocaleString() : 'no'
    let analysisString = '';
    let restaurantListText = ''
    if (numMichelinStar < threshold) {
      // Not many michelin star restaurants
      if (this.income > this.averageIncome) {
        analysisString = 'With an above average income, this could be a great place for an aspiring restauranteur to open up a high end restaurant!'
      } else {
        analysisString = 'This may be a result of the below average income level.'
        if (this.population > this.averageZipPopulation) {
          analysisString += ' But with such a large population, it may still be a great place for an aspring restauranteur to open up a high end restaurant!'
        }
      }
    } else {
      // Many michelin star restaurants
      restaurantListText = `, including ${this.michelinRestaurants[0].name}, ${this.michelinRestaurants[1].name}, and ${this.michelinRestaurants[2].name}`
      if (this.income > this.averageIncome) {
        analysisString = 'It is likely that there are so many high end restaurants as a result of the above average income level!'
      } else {
        analysisString = 'It is suprising that there are so many high end restaurants, as the income level is below average.'
      }
    }
    return (
      <section>
        <div style={{ width: '70%', display: 'flex', alignItems: 'center' }}>
          <div className='speech-bubble-right' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ fontSize: 30 }}>{`There are ${michelinCountStr} Michelin Star rated restaurants within 20 miles of ${this.zipcode}${restaurantListText}. ${analysisString}`}</p>
          </div>
          <img src={require('../assets/hungerspeak.gif')} alt="hungerbot" width={300} height={300} />
        </div>
      </section>

    )
  }

  generateFastFoodText(threshold = 3) {
    let numFastFood = this.fastFoodRestaurants.length
    let fastFoodCountStr = numFastFood > 0 ? numFastFood.toLocaleString() : 'no'
    let analysisString = '';
    if (numFastFood < threshold) {
      // Not many michelin star restaurants
      if (this.income > this.averageIncome) {
        analysisString = 'With an above average income, this could be a great place for an aspiring restauranteur to open up a high end restaurant!'
      } else {
        analysisString = 'This may be a result of the below average income level.'
      }
    } else {
      // Many michelin star restaurants
      if (this.income > this.averageIncome) {
        analysisString = 'This is likely a result of the above average income level!'
      } else {
        analysisString = 'This is surprising, as the income level is below average.'
      }
    }
    return (
      <section>
        <div className="bordered-card" style={{ width: '70%' }}>
          <h1 className="emoji-icon">🍔</h1>
          <p className="card-text">{`There are ${fastFoodCountStr} fast food restaurants within 20 miles of ${this.zipcode}. ${analysisString}`}</p>
        </div>
      </section>

    )
  }
}