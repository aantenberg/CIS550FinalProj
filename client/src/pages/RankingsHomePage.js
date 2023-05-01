import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';
import LoadingIcon from '../components/LoadingIcon';

const config = require('../config.json');

const createMultiset = list => {
  let result = {}
  for (const element of list) {
    const firstChar = element.State.substring(0, 1)
    if (result[firstChar]) {
      result[firstChar].push(element.State)
    } else {
      result[firstChar] = [element.State]
    }
  }
  return result
}

export default function RankingsHomePage() {
  const [statesDict, setStatesDict] = useState({})
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/all-states`)
      .then(res => res.json())
      .then(resJson => setStatesDict(createMultiset(resJson)));
  }, [])

  useEffect(() => {
    console.log(states);
  }, [states])

  // flexFormat provides the formatting options for a "flexbox" layout that enables the album cards to
  // be displayed side-by-side and wrap to the next line when the screen is too narrow. Flexboxes are
  // incredibly powerful. You can learn more on MDN web docs linked below (or many other online resources)
  // https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox
  const flexFormat = { display: 'grid' };
  let i = 0;

  return (
    <div>
      {isLoading ? <LoadingIcon /> : <></>}
      <Container style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr'}}>
        {Object.entries(statesDict).sort((a, b) => a[0].localeCompare(b[0])).map(([letter, states]) =>
          <div className="panel" style={{margin: 30, padding: 20}} key={++i}>
            <h1>{letter}</h1>
            {states.map(s => {
              return <h4 key={++i}><NavLink className="rainbow-underline undecorated-link" style={{ color: "var(--white)", lineHeight: 1.5}} to={`/state-rankings?state=${s}`} onClick={() => setIsLoading(true)}>{s}</NavLink></h4>
            })}
          </div>

          // <Box
          //   key={++i}
          //   p={3}
          //   m={2}
          //   style={{ background: 'var(--panel-color)', borderRadius: '16px', border: '2px solid var(--item-border)' }}
          // >

          //   {/* <img
          //   src={album.thumbnail_url}
          //   alt={`${album.title} album art`}
          // /> */}

          //   <h4><NavLink className="rainbow-underline undecorated-link" style={{ color: "var(--white)" }} to={`/state-rankings?state=${state.State}`} onClick={() => setIsLoading(true)}>{state.State}</NavLink></h4>
          // </Box>
        )}
      </Container>
    </div>
  );
}