import { MapStyles } from '../mapConfig'
import React, { useRef, useState, useEffect } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { createCustomEqual } from "fast-equals"
import { isLatLngLiteral } from "@googlemaps/typescript-guards"

export default function RestaurantMap({ center }) {

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
        switch (status) {
            case Status.LOADING:
                return <p>Loading...</p>
            case Status.FAILURE:
                return <p>{`Failed to load google maps`}</p>
            case Status.SUCCESS:
                return (
                    <Map
                        onBoundsChanged={runBoundedRestaurantsSearch}
                        searchedCenter={center}
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
                    </Map>
                )
            default:
                console.error('invalid map state')
                return <p>{`Failed to load google maps`}</p>
        }
    }


    return (
        <Wrapper apiKey={'AIzaSyC2C8b0d417bYDpHxIbsYZgJrT0hRC4TZc'} render={render} />
    )
}

const Map = ({
    onBoundsChanged,
    searchedCenter,
    children,
    style,
    ...options
}) => {

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
        console.log(JSON.stringify(location))
        map?.panTo({ lat: location.coords.latitude, lng: location.coords.longitude })
    }

    useEffect(() => {
        moveToUserLocation({ coords: searchedCenter })
    }, [searchedCenter])

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
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
            <div id='my-location-container' onClick={() => getLocation().then(loc => moveToUserLocation(loc.position))}>
                <span class="material-symbols-outlined">
                    my_location
                </span>
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

    const image = {
        url: require('../assets/map-marker.png'),
        size: new window.google.maps.Size(32, 32),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(4, 4),
        scaledSize: new window.google.maps.Size(8, 8)
    }

    useEffect(() => {
        if (!marker) {
            setMarker(new window.google.maps.Marker({
                icon: image
            }))
        }

        return () => {
            if (marker) {
                marker.setMap(null)
            }
        }
    }, [marker])

    useEffect(() => {
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
