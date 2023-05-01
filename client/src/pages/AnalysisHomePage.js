import { useState } from "react";
import LittleButton from "../components/LittleButton";
import { useNavigate } from "react-router-dom";
import LoadingIcon from "../components/LoadingIcon";

export default function AnalysisHomePage() {

    const [zipcode, setZipcode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()


    const isValidZipcode = (!Number.isNaN(+zipcode)) && zipcode.length === 5

    const onSubmit = () => {
        setIsLoading(true)
        navigate({
            pathname: `/analyze`,
            search: `?zipcode=${zipcode}`
        })
    }

    return (
        <div>
            {isLoading ? <LoadingIcon /> : <></>}
            <div style={{ textAlign: 'center', padding: 50 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', margin: '1rem auto', width: '60%', alignItems: 'center' }}>
                    <img src={require('../assets/hungerbot.gif')} alt="hungerbot" width={300} />
                    <div className='speech-bubble'>
                        <h2>Hey, I'm HUNG3RB0T!</h2>
                        <p>I'm here to help you analyze food and income disparity in a given region. Give me a zipcode, and we'll get started!</p>
                    </div>
                </div>

                <div style={{ margin: 80, justifyContent: 'center', display: 'flex', flexDirection: 'row', gap: 8 }}>
                    <input
                        placeholder="Zip code"
                        onChange={(e) => setZipcode(e.nativeEvent.target.value)}
                    ></input>
                    <LittleButton style={{ width: 100 }} label={'Analyze'} onClick={onSubmit} disabled={!isValidZipcode} />
                </div>
            </div>
        </div>
    )
}