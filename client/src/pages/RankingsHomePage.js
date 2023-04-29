import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';

const config = require('../config.json');

export default function RankingsHomePage() {
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/all/states`)
      .then(res => res.json())
      .then(resJson => setStates(resJson.sort((a, b) => a.State.localeCompare(b.State))));
  }, []);

  useEffect(() => {
      console.log(states);
  }, [states]);

  // flexFormat provides the formatting options for a "flexbox" layout that enables the album cards to
  // be displayed side-by-side and wrap to the next line when the screen is too narrow. Flexboxes are
  // incredibly powerful. You can learn more on MDN web docs linked below (or many other online resources)
  // https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox
  const flexFormat = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' };
  let i =0; 

  return (
    // TODO (TASK 22): replace the empty object {} in the Container's style property with flexFormat. Observe the change to the Albums page.
    // TODO (TASK 22): then uncomment the code to display the cover image and once again observe the change, i.e. what happens to the layout now that each album card has a fixed width?
    <Container style={flexFormat}>
      {states.map((state) =>
        <Box
          key={++i}
          p={3}
          m={2}
          style={{ background: 'var(--panel-color)', borderRadius: '16px', border: '2px solid var(--item-border)' }}
        >

          {/* <img
            src={album.thumbnail_url}
            alt={`${album.title} album art`}
          /> */}

          <h4><NavLink className="rainbow-underline undecorated-link" style={{color: "var(--white)"}} to={`/state-rankings?state=${state.State}`}>{state.State}</NavLink></h4>
        </Box>
      )}
    </Container>
  );
}