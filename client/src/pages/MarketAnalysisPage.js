import FormContainer from "../components/FormContainer";
import { useLoaderData, useLocation, useParams } from "react-router";
import Table from "../components/Table";

export async function marketAnalysisLoader(props) {

    console.log(`Loading: ${JSON.stringify(props.request.url)}`)

    const url = new URL(props.request.url)
    const params = url.searchParams

    const zipcode = params.get('zipcode')
    const radius = params.get('radius')

    const urlIsInvalid = 
        ! zipcode ||
        ! radius ||
        zipcode.length !== 5 ||
        Number.isNaN(+zipcode) ||
        Number.isNaN(+radius)

    if (urlIsInvalid) {
        console.error(`Query is invalid: ${JSON.stringify(params)}`)
        return null
    }

    const parsedZipcode = Number.parseInt(zipcode)
    const parsedRadius = Number.parseFloat(radius)

    // Get the population
    // Get the average income
    // Get the number of restaurants per capita of both types

    const populationReq = fetch(`http://localhost:8080/population?zipcode=${parsedZipcode}&radius=${parsedRadius}`)
    const incomeReq = fetch(`http://localhost:8080/income?zipcode=${parsedZipcode}&radius=${parsedRadius}`)
    const fastFoodRestaurantsReq = await fetch(`http://localhost:8080/restaurants/fast-food/?zipcode=${parsedZipcode}&radius=${parsedRadius}`)
    const michelinStarRestaurantsReq = await fetch(`http://localhost:8080/restaurants/michelin-star/?zipcode=${parsedZipcode}&radius=${parsedRadius}`)
    
    const [populationRes, incomeRes, fastFoodRestaurantsRes, michelinStarRestaurantsRes] = await Promise.all([populationReq, incomeReq, fastFoodRestaurantsReq, michelinStarRestaurantsReq])

    const population = (await populationRes.json()).numPeople
    const averageIncome = (await incomeRes.json()).averageIncome
    const fastFoodRestaurants = ((await fastFoodRestaurantsRes.json())).length
    const michelinStarRestaurants = ((await michelinStarRestaurantsRes.json())).length

    return {
        results: {
            population,
            averageIncome,
            capitaPerFastFood: population / fastFoodRestaurants,
            capitaPerMichelinStar: population / michelinStarRestaurants
        },
        query: {
            zipcode: parsedZipcode,
            radius: parsedRadius
        }
    }
}

export default function MarketAnalysisPage() {

    const data = useLoaderData()

    return (
        <FormContainer>
            <h1 className="margin-bottom-8">Market Analysis</h1>
            <p className="margin-bottom-32">Of a {data.query.radius} mile radius around {data.query.zipcode}</p>
            <p>The population of this area is {data.results.population}, and the average income is ${data.results.averageIncome}.</p>
            <p>There is 1 fast food restaurant per {data.results.capitaPerFastFood} people, and one Michelin Star restaurant per {data.results.capitaPerMichelinStar} people.</p>
        </FormContainer>
    )
}