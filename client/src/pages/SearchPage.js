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
    const isValidRadius = (!Number.isNaN(+radius)) && radius.length > 0 && Number.parseFloat(radius) > 0

    const runAllRestaurantsSearch = () => {
        navigate({
            pathname: `/search/all`,
            search: `?zipcode=${zipcode}&radius=${radius}`
        })
    }

    const runClosestRestaurantsSearch = () => {
        navigate({
            pathname: '/search/closest',
            search: `?zipcode=${zipcode}`
        })
    }

    return (
        <FormContainer>
            <h1 className="margin-bottom-32">Zip Code Search</h1>
            <p className="margin-bottom-8">Enter a zip code and radius (in miles):</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                <input
                    placeholder="Zip code"
                    className="small margin-bottom-16"
                    onChange={(e) => setZipcode(e.nativeEvent.target.value)}
                ></input>
                <input
                    placeholder="Radius"
                    className="small margin-bottom-16"
                    onChange={(e) => setRadius(e.nativeEvent.target.value)}
                ></input>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                <LittleButton label={'All Restaurants'} onClick={runAllRestaurantsSearch} disabled={ ! isValidZipcode || ! isValidRadius} />
                <LittleButton label={'Closest Restaurants'} onClick={runClosestRestaurantsSearch} disabled={ ! isValidZipcode} />
            </div>
            <RestaurantMap />
        </FormContainer>
    )
}