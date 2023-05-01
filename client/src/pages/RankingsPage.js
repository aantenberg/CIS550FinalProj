import FormContainer from "../components/FormContainer";
import { useLoaderData } from "react-router";
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
      <div className="margin-bottom-32" style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '16px' }}>
        <h1>{data.query.state} </h1>
        <p> a FoodFind Report</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <p><b>Total number of restaurants:</b> {data.restaurants.countRestaurants}</p>
        <p><b>Total number of Michelin Star restaurants:</b> {data.michelinRestaurants.countRestaurants}</p>
        <p><b>Average per capita income:</b> {dollarFormat(data.income.averageIncome)}</p>
        <p><b>People per restaurant:</b> {Math.round(1 / data.perCapita.RestaurantsPerCapita)}</p>
      </div>

      <h3 className="margin-bottom-8 margin-top-32"> Most popular fast food restaurants in {data.query.state} </h3>
      <Table schema={[['Name', 'name'], ['Count', 'countRestaurants']]} data={data.fastFoodRanking} />


      <h3 className="margin-bottom-8 margin-top-32">Top 5 {data.query.state} specialties</h3>
      <Table schema={[['Name', 'name'], ['Count', 'location_count']]} data={data.singleState} />

    </FormContainer>


  );
}