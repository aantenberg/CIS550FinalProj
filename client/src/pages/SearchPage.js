import { useState } from "react";
import FormContainer from "../components/FormContainer";
import LittleButton from "../components/LittleButton";
import { useNavigate } from "react-router";
import RestaurantMap from "../components/Map";
import Table from "../components/Table";

// function parseToken(primary, secondary) {

    

//     if (Object.keys(daysOfWeek).includes(primary)) {
//         if (Object.keys(daysOfWeek).includes(secondary)) {
//             // It's a day of the week range
//             return {
//                 type: 'DOW_RANGE',
//                 first: daysOfWeek[primary],

//             }
//         }
//     }
// }

// function replaceDOWRanges(hours) {

//     const daysOfWeek = {
//         'Sun': 0,
//         'Mon': 1,
//         'Tue': 2,
//         'Wed': 3,
//         'Thu': 4,
//         'Fri': 5,
//         'Sat': 6
//     }

//     function replacer(match, p1, p2) {
//         return { 'type': 'DOW_RANGE', 'start': daysOfWeek[p1], 'end': daysOfWeek[p2] }
//     }

//     return hours.replaceAll(/(Sun  |Mon  |Tue  |Wed  |Thu  |Fri  |Sat  )(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/g, replacer)
// }

// function convertToNumericalHour(timeStr, isPM) {

//     const paddedStr = str.padStart(4, "0");

//     const hour = parseInt(paddedStr.substr(0, 2));
//     const minute = parseInt(paddedStr.substr(2, 2));
  
//     if (isPM && hour !== 12) {
//       hour += 12;
//     }
  
//     const numericalHour = hour + minute / 60;
  
//     return numericalHour;
// }

// function replaceHourRanges(hours) {

//     function replacer(match, p1, p2, p3, p4) {

//         p1.

//         return `${p1}${p2}-${p3}${p4}`
//     }

//     return hours.replaceAll(/(?:(\d+) (AM|PM)  (\d+) (AM|PM))/g, replacer)
// }

// function isOpen(hours) {
//     // if ( ! hours || hours === 'Unknown') {
//     //     return false
//     // }

//     hours = (replaceDOWRanges(replaceHourRanges('Sun 1100 AM  930 PM | Mon  Thu 1030 AM  930 PM | Fri 1030')))
//     const tokens = hours.split(' ').filter(x => x.length > 0)
    
//     const ranges = []

//     let currentRange = null

//     for (const token in tokens) {
//         if (currentRange == null) {
//             currentRange = [token]
//         } else {
//             if (token === '|') {
//                 ranges.push(currentRange)
//                 currentRange = null
//             } else {
//                 currentRange.push(token)
//             }
//         }
//     }

//     ranges.push(currentRange)

//     for (const range of ranges) {
//         for (const token of range) {

//         }
//     }

//     const d = new Date()
//     const day = d.getDay()
// }

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

