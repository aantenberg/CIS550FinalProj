import { MapStyles } from '../mapConfig'
import React, { useRef, useState, useEffect } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { createCustomEqual } from "fast-equals"
import { isLatLngLiteral } from "@googlemaps/typescript-guards"

export default function RestaurantMap() {

    const defaultLocation = {
        lat: 38.648785,
        lng: -90.310729
    }

    const [restaurantPositions, setRestaurantPositions] = useState([])

    const runBoundedRestaurantsSearch = async (mapBounds) => {
        const query = `http://localhost:8080/restaurants-within?latitude1=${mapBounds.south}&latitude2=${mapBounds.north}&longitude1=${mapBounds.west}&longitude2=${mapBounds.east}`
        const results = await fetch(query)
        const obj = await results.json()
        setRestaurantPositions(obj)
    }

    const render = (status) => {
        console.log(status)
        switch (status) {
            case Status.LOADING:
                return <p>Loading...</p>
            case Status.FAILURE:
                return <p>{`Failed to load google maps`}</p>
            case Status.SUCCESS:
                console.log('rendering map')
                return (
                    <LocationInputMap
                        onBoundsChanged={runBoundedRestaurantsSearch}
                        center={defaultLocation}
                        zoom={12}
                        streetViewControl={false}
                        fullscreenControl={false}
                        mapTypeControl={false}
                        styles={MapStyles}
                    >
                        {
                            restaurantPositions?.map((position, index) => (
                                <MapMarker key={index} position={position} />
                            ))
                        }
                    </LocationInputMap>
                )
            default:
                console.error('invalid map state')
                return <p>{`Failed to load google maps`}</p>
        }
    }


    return (
        <Wrapper apiKey={'AIzaSyBCdOph1FqRHjuTRwy3P0zp4-zoiqeZYz8'} render={render} />
    )
}

const LocationInputMap = ({
    onBoundsChanged,
    children,
    style,
    ...options
}) => {

    console.log('re-rendering map')

    const ref = useRef(null)
    const [map, setMap] = useState(undefined)

    useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {})
            setMap(newMap)
            newMap.addListener("idle", () => {
                onBoundsChanged(newMap.getBounds().toJSON())
            })
        }
    }, [ref, map, onBoundsChanged])

    useDeepCompareEffectForMaps(() => {
        if (map) {
            map.setOptions(options);
        }
    }, [map, options]);

    const moveToUserLocation = (location) => {
        if (!location) { return }
        map?.panTo({ lat: location.coords.latitude, lng: location.coords.longitude })
    }

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => getLocation().then(loc => moveToUserLocation(loc.position))}>Locate Me</button>
            <div style={{ position: 'relative' }}>
                <div className='map-container' ref={ref} id='map'>
                    {
                        React.Children.map(children, (child) => {
                            if (React.isValidElement(child)) {
                                // set the map prop on the child component
                                // @ts-ignore
                                return React.cloneElement(child, { map });
                            }
                        })
                    }
                </div>
            </div>
        </div>
    )
}

const getLocation = async () => {
    return new Promise((resolve, _reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({ position, error: null })
        }, (error) => {
            resolve({ position: null, error })
        })
    })
}

const MapMarker = (options) => {
    const [marker, setMarker] = useState()

    useEffect(() => {
        if (!marker) {
            setMarker(new window.google.maps.Marker())
        }

        return () => {
            if (marker) {
                marker.setMap(null)
            }
        }
    }, [marker])

    React.useEffect(() => {
        if (marker) {
            marker.setOptions(options)
        }
    }, [marker, options])

    return null
};

const deepCompareEqualsForMaps = createCustomEqual(
    (deepEqual) => (a, b) => {
        if (
            isLatLngLiteral(a) ||
            a instanceof window.google.maps.LatLng ||
            isLatLngLiteral(b) ||
            b instanceof window.google.maps.LatLng
        ) {
            return new window.google.maps.LatLng(a).equals(new window.google.maps.LatLng(b));
        }

        // TODO extend to other types

        // use fast-equals for other objects
        return deepEqual(a, b);
    }
);

function useDeepCompareMemoize(value) {
    const ref = React.useRef();

    if (!deepCompareEqualsForMaps(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
}

function useDeepCompareEffectForMaps(
    callback,
    dependencies
) {
    useEffect(callback, dependencies.map(useDeepCompareMemoize));
}
