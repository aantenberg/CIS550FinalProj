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
    const [tooltipOptions, setTooltipOptions] = useState(null)

    const runBoundedRestaurantsSearch = async (mapBounds) => {

        if ( ! mapBounds) {
            return
        }

        const query = `http://localhost:8080/restaurants-within?latitude1=${mapBounds.south}&latitude2=${mapBounds.north}&longitude1=${mapBounds.west}&longitude2=${mapBounds.east}`
        const results = await fetch(query)
        const restaurants = await results.json()

        for (const restaurant of restaurants) {

            if (restaurant.num_stars == null) {
                continue
            }

            if (restaurant.name === 'North Pond') {
                console.log(restaurant)
            }

            const starString = '⭐️'.repeat(restaurant.num_stars)

            restaurant.name += ` (${starString})`
        }

        setRestaurantPositions(restaurants)
    }

    const onMarkerMouseover = (obj) => {
        setTooltipOptions(obj)
    }

    const onMarkerMouseout = () => {
        setTooltipOptions(null)
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
                        onTooltipMouseover={onMarkerMouseout}
                        tooltipOptions={tooltipOptions}
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
                                <MapMarker 
                                    key={index} 
                                    position={position} 
                                    onMarkerMouseover={onMarkerMouseover}
                                    onMarkerMouseout={onMarkerMouseout}
                                />
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
    onTooltipMouseover,
    tooltipOptions,
    searchedCenter,
    children,
    style,
    ...options
}) => {

    const ref = useRef(null)
    const [map, setMap] = useState(undefined)
    const [tooltipLocation, setTooltipLocation] = useState(null)
    const [tooltipText, setTooltipText] = useState('')
    const [locationWatchInfo, setLocationWatchInfo] = useState({ isWatching: false, watchID: null })

    useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {})
            setMap(newMap)
            newMap.addListener("idle", () => {
                onBoundsChanged(newMap.getBounds()?.toJSON())
            })
        }
    }, [ref, map, onBoundsChanged])

    useDeepCompareEffectForMaps(() => {
        if (map) {
            map.setOptions(options)
        }
    }, [map, options])

    const moveToLocation = (location) => {
        if (!location || !location.coords) { return }
        map?.panTo({ lat: location.coords.latitude, lng: location.coords.longitude })
    }

    useEffect(() => {

        if (locationWatchInfo.isWatching && ! locationWatchInfo.watchID) {
            const watchID = navigator.geolocation.watchPosition((position) => {
                if (locationWatchInfo.isWatching) {
                    moveToLocation(position)
                }
            }, (e) => {
                if (e.message === 'Timeout expired') {
                    navigator.geolocation.clearWatch(locationWatchInfo.watchID)
                    setLocationWatchInfo({ ...locationWatchInfo, watchID: null })
                }
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 1
            })
            setLocationWatchInfo({ ...locationWatchInfo, watchID })
            return () => { 
                setLocationWatchInfo({ ...locationWatchInfo, isWatching: false })
                navigator.geolocation.clearWatch(locationWatchInfo.watchID)
            }
        }

        if ( ! locationWatchInfo.isWatching && locationWatchInfo.watchID) {
            navigator.geolocation.clearWatch(locationWatchInfo.watchID)
            setLocationWatchInfo({ ...locationWatchInfo, watchID: null })
            return
        }

    }, [locationWatchInfo.isWatching])

    useEffect(() => {
        moveToLocation({ coords: searchedCenter })
        setLocationWatchInfo({ ...locationWatchInfo, isWatching: false })
    }, [searchedCenter])

    useEffect(() => {

        if ( ! tooltipOptions) {
            setTooltipLocation(null)
            return 
        }

        const divBounds = map.getDiv().getBoundingClientRect()

        setTooltipLocation({ x: tooltipOptions.event.clientX - divBounds.left, y: tooltipOptions.event.clientY - divBounds.top })
        setTooltipText(tooltipOptions.name)

    }, [tooltipOptions])

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
            <div 
                id='my-location-container' 
                onClick={() => setLocationWatchInfo({ ...locationWatchInfo, isWatching: !locationWatchInfo.isWatching })} 
            >
                <span className="material-symbols-outlined" style={{ color: locationWatchInfo.isWatching ? 'var(--theme-main)' : 'black' }}>
                    my_location
                </span>
            </div>
            {
                tooltipLocation ? 
                    <div className='tooltip-container' style={{ top: tooltipLocation.y, left: tooltipLocation.x }} onMouseEnter={onTooltipMouseover}>
                        <h4>{tooltipText}</h4>
                    </div>
                    :
                    null
            }
        </div>
    )
}

const getLocation = async () => {
    return new Promise((resolve, _reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({ position, error: null })
        }, (error) => {
            resolve({ position: null, error })
        }, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: Infinity
        })
    })
}

const MapMarker = (options) => {
    const [marker, setMarker] = useState()
    const [listeners, setListeners] = useState()

    const image = {
        url: require('../assets/map-marker.png'),
        size: new window.google.maps.Size(32, 32),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(4, 4),
        scaledSize: new window.google.maps.Size(8, 8)
    }

    const michelinImage = {
        url: require('../assets/map-marker-michelin.png'),
        size: new window.google.maps.Size(32, 32),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(4, 4),
        scaledSize: new window.google.maps.Size(8, 8)
    }

    useEffect(() => {
        if (!marker) {
            const newMarker = new window.google.maps.Marker({
                icon: options.position.num_stars == null ? image : michelinImage
            })
            setMarker(newMarker)
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
            marker.setIcon(options.position.num_stars == null ? image : michelinImage)

            if (listeners) {
                listeners.forEach(listener => window.google.maps.event.removeListener(listener))
            }

            const newMouseoverListener = marker.addListener('mouseover', (e) => {
                options.onMarkerMouseover({ event: e.domEvent, name: options.position.name })
            })

            const newMouseoutListener = marker.addListener('mouseout', (e) => {
                options.onMarkerMouseout()
            })

            setListeners([newMouseoutListener, newMouseoverListener])

            return () => listeners?.forEach(listener => window.google.maps.event.removeListener(listener))
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
            return new window.google.maps.LatLng(a).equals(new window.google.maps.LatLng(b))
        }

        return deepEqual(a, b)
    }
)

function useDeepCompareMemoize(value) {
    const ref = React.useRef()

    if (!deepCompareEqualsForMaps(value, ref.current)) {
        ref.current = value
    }

    return ref.current
}

function useDeepCompareEffectForMaps(
    callback,
    dependencies
) {
    useEffect(callback, dependencies.map(useDeepCompareMemoize))
}
