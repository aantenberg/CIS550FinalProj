import FormContainer from "../components/FormContainer";
import { useLoaderData, useLocation, useParams } from "react-router";
import Table from "../components/Table";

export async function closestRestaurantsLoader(props) {

    console.log(`Loading: ${JSON.stringify(props.request.url)}`)

    const url = new URL(props.request.url)
    const params = url.searchParams

    const zipcode = params.get('zipcode')

    const urlIsInvalid = 
        ! zipcode ||
        zipcode.length !== 5 ||
        Number.isNaN(+zipcode)

    if (urlIsInvalid) {
        console.error(`Query is invalid: ${JSON.stringify(params)}`)
        return null
    }

    const parsedZipcode = Number.parseInt(zipcode)

    const results = await fetch(`http://localhost:8080/closest-restaurants/fast-food?zipcode=${parsedZipcode}`)

    const body = await results.json()

    return {
        restaurants: body,
        query: {
            zipcode: parsedZipcode
        }
    }
}

export default function ClosestRestaurantsPage() {

    const data = useLoaderData()

    return (
        <FormContainer>
            <h1 className="margin-bottom-8">Closest Restaurants</h1>
            <p className="margin-bottom-32">Near {data.query.zipcode}</p>
            <Table schema={[['Name', 'name'], ['Latitude', 'latitude'], ['Longitude', 'longitude'], ['Distance (mi)', 'distanceInMiles']]} data={data.restaurants}/>
        </FormContainer>
    )
}