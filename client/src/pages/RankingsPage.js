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
<h1 className="margin-bottom-15" style ={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.query.state}</h1>
        <FormContainer style={{ marginBottom: '3px' }}>
        
        <table style={{ color: 'white' }}>
        <tr>
          <th> </th>
          <th> </th>
        </tr>
        <tr>
          <td>Total Number of Restaurants is:</td>
          <td>{data.restaurants.countRestaurants} </td>
        </tr>
        <tr>
          <td>Total Number of Michelin Restaurants is:</td>
          <td>{data.michelinRestaurants.countRestaurants} </td>
        </tr>
        <tr>
          <td>Average Income is:</td>
          <td>{dollarFormat(data.income.averageIncome)}</td>
        </tr>
        <tr>
          <td>Restaurants Per Capita:</td>
          <td>{data.perCapita.RestaurantsPerCapita}</td>
        </tr>
      </table>
        </FormContainer>

        <FormContainer style={{ marginBottom: '3px' }}>
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