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

    // Fetch all the restaurants in the given area...
    
    return {
        restaurants: [{
            name: "McD",
            latitude: 30,
            longitude: 30,
            zipcode: parsedZipcode
        },
        {
            name: "Wendy's",
            latitude: 30,
            longitude: 30,
            zipcode: parsedZipcode
        },
        {
            name: "A&W",
            latitude: 30,
            longitude: 30,
            zipcode: parsedZipcode
        },
        {
            name: "Nobu",
            latitude: 30,
            longitude: 30,
            zipcode: parsedZipcode
        }],
        query: {
            radius: parsedZipcode,
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
            <Table schema={['Name', 'Latitude', 'Longitude', 'Zip Code']} data={data.restaurants}/>
        </FormContainer>
    )
}