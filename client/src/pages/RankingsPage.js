import FormContainer from "../components/FormContainer";
import { useLoaderData} from "react-router";
import { dollarFormat } from "../helpers/formatter";
import Table from "../components/Table";

export async function rankingsLoader(props) {

    console.log(`Loading: ${JSON.stringify(props.request.url)}`)

    const url = new URL(props.request.url)
    const params = url.searchParams

    const state = params.get('state')

    const results = await fetch(`http://localhost:8080/restaurants/by-state/${state}`)
    const michelinResults = await fetch(`http://localhost:8080/restaurants/michelin/by-state/${state}`)
    const incomeResults = await fetch(`http://localhost:8080/income/by-state?state=${state}`)
    const perCapitaResults = await fetch(`http://localhost:8080/restaurants/per-capita/${state}`)
    const singleState = await fetch(`http://localhost:8080/restaurants/single-state/${state}`)
    const fastFoodRankingResults = await fetch(`http://localhost:8080/restaurants/by-state/top/${state}`)

    const body = await results.json()
    const body2 = await michelinResults.json()
    const body3 = await incomeResults.json()
    const body4 = await perCapitaResults.json()
    const body5 = await singleState.json()
    const body6 = await fastFoodRankingResults.json()
    
    return {
        restaurants: body,
        michelinRestaurants: body2,
        income: body3,
        perCapita: body4,
        singleState: body5,
        fastFoodRanking: body6,
        query: {
            state: state,
        }
    }
}


export default function RankingsPage() {

  // const { state } = useParams();

  const data = useLoaderData(); 

console.log(data.restaurants)
console.log(data.perCapita)

  return (
    <FormContainer>

      <FormContainer>
        <h1 className="margin-bottom-8">{data.query.state}</h1>
        <p className="margin-bottom-32"> Total Number of Restaurants is: {data.restaurants.countRestaurants} </p>
        <p className="margin-bottom-32"> Total Number of Michelin Restaurants is: {data.michelinRestaurants.countRestaurants} </p>
        <p className="margin-bottom-32"> Average Income is: {dollarFormat(data.income.averageIncome)} </p>
        <p className="margin-bottom-32"> Restaurants Per Capita: {data.perCapita.RestaurantsPerCapita} </p>
        </FormContainer>

        <FormContainer>
          <p className="margin-bottom-32"> Most popular Fast Food Restaurants in {data.query.state} </p> 
          <Table schema={[['Name', 'name'], ['Count', 'countRestaurants']]} data={data.fastFoodRanking}/>
        </FormContainer>


        <FormContainer>
            <p className="margin-bottom-32">Top 5 Restaurants only in {data.query.state}</p>
            <Table schema={[['Name', 'name'], ['Count', 'location_count']]} data={data.singleState}/>
        </FormContainer>

    </FormContainer>


  );
}