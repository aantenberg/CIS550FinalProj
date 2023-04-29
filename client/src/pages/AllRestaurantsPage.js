import FormContainer from "../components/FormContainer";
import { useLoaderData, useLocation, useParams } from "react-router";
import Table from "../components/Table";

export async function allRestaurantsLoader(props) {

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

    const results = await fetch(`http://localhost:8080/restaurants/?zipcode=${parsedZipcode}&radius=${parsedRadius}`)

    const body = await results.json()
    
    return {
        restaurants: body,
        query: {
            radius: parsedRadius,
            zipcode: parsedZipcode
        }
    }
}

export default function AllRestaurantsPage() {

    const data = useLoaderData()

    return (
        <FormContainer>
            <h1 className="margin-bottom-8">All Restaurants</h1>
            <p className="margin-bottom-32">Within a {data.query.radius} mile radius centered around {data.query.zipcode}</p>
            <Table schema={[['Name', 'name'], ['Latitude', 'latitude'], ['Longitude', 'longitude']]} data={data.restaurants}/>
        </FormContainer>
    )
}