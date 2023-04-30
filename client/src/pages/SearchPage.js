import { useState } from "react";
import FormContainer from "../components/FormContainer";
import LittleButton from "../components/LittleButton";
import { useNavigate } from "react-router";
import RestaurantMap from "../components/Map";

export default function SearchPage() {

    const navigate = useNavigate()

    const [zipcode, setZipcode] = useState('')
    const [radius, setRadius] = useState('')

    const isValidZipcode = (!Number.isNaN(+zipcode)) && zipcode.length === 5
    
    const [searchedCenter, setSearchedCenter] = useState(null)
    const [didError, setDidError] = useState(false)

    const navigateToZipcode = async () => {
        const result = await fetch(`http://localhost:8080/location?zipcode=${zipcode}`)
        const obj = await result.json()
        if ( ! obj.latitude || ! obj.longitude) {
            console.error(`Not a valid zipcode! ${JSON.stringify(obj)}`)
            setDidError(true)
            return
        }
        const newCenter = obj
        setDidError(false)
        setSearchedCenter(newCenter)
    }

    return (
        <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
            <RestaurantMap center={searchedCenter} />
            <div class='absolute-form-container'>
                <h2 className="margin-bottom-16">Explore Restaurants</h2>
                <p className="margin-bottom-8">Enter a zip code to navigate</p>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                    <input
                        placeholder="Zip code"
                        className="small margin-bottom-16"
                        onChange={(e) => setZipcode(e.nativeEvent.target.value)}
                    ></input>
                </div>
                {
                    didError ? 
                        <p className="margin-bottom-8">Oops! That didn't work, please try again</p>
                        :
                        null
                }
                <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                    <LittleButton label={'Navigate'} onClick={navigateToZipcode} disabled={ ! isValidZipcode } />
                    {/* <LittleButton label={'Closest Restaurants'} onClick={runClosestRestaurantsSearch} disabled={ ! isValidZipcode} /> */}
                </div>
            </div>
        </div>
    )
}

