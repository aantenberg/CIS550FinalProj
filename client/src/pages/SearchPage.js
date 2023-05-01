import { useState } from "react";
import FormContainer from "../components/FormContainer";
import LittleButton from "../components/LittleButton";
import { useNavigate } from "react-router";
import RestaurantMap from "../components/Map";
import Table from "../components/Table";

export default function SearchPage() {

    const [zipcode, setZipcode] = useState('')

    const isValidZipcode = (!Number.isNaN(+zipcode)) && zipcode.length === 5
    
    const [searchedCenter, setSearchedCenter] = useState(null)
    const [closestRestaurants, setClosestRestaurants] = useState([])
    const [didError, setDidError] = useState(false)

    const navigateToZipcode = async () => {
        const zipCodeQuery = fetch(`http://localhost:8080/location?zipcode=${zipcode}`)
        const closestRestaurantsQuery = fetch(`http://localhost:8080/closest-restaurants/fast-food?zipcode=${zipcode}`)

        setDidError(false)
        setClosestRestaurants([])

        const [zipCodeResult, closestRestaurantsResult] = await Promise.all([zipCodeQuery, closestRestaurantsQuery])

        let location = null
        let closestRestaurants = null;

        try {
            location = await zipCodeResult.json()
            closestRestaurants = await closestRestaurantsResult.json()

            if ( ! location.latitude || ! location.longitude) { 
                throw new Error('bad zipcode')
            }

        } catch (e) {
            console.error(`Not a valid zipcode! ${JSON.stringify(location)}`)
            setDidError(true)
            return
        }

        const newCenter = location
        setDidError(false)
        setSearchedCenter(newCenter)
        setClosestRestaurants(closestRestaurants)
    }

    return (
        <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
            <RestaurantMap center={searchedCenter} />
            <div className='absolute-form-container'>
                <h2 className="margin-bottom-16">Explore Restaurants</h2>
                <p className="margin-bottom-8">Enter a zip code to navigate</p>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                    <input
                        placeholder="Zip code"
                        className="small"
                        onChange={(e) => setZipcode(e.nativeEvent.target.value)}
                    ></input>
                    <LittleButton label={'Navigate'} onClick={navigateToZipcode} disabled={ ! isValidZipcode } />
                </div>
                {
                    didError ? 
                        <p className="margin-top-8">Oops! That didn't work, please try again</p>
                        :
                        null
                }
                {
                    closestRestaurants.length > 0 ?
                        <>
                            <h3 className="margin-top-16 margin-bottom-8">Closest Restaurants</h3>
                            <Table schema={[['Name', 'name'], ['Distance (mi)', 'distanceInMiles']]} data={closestRestaurants}/>
                        </>
                        :
                        null
                }
            </div>
        </div>
    )
}

