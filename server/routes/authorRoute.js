// GET: author/:type
const author = async function(req, res) {
  
  const names = 'Andrew Antenberg, Rachel Ko, Thomas Urey, and Natalie Rosenbaum';
  const pennKeys = 'aanten, rachelko, turey, natros';

  // checks the value of type the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.send returns data back to the requester via an HTTP response
    res.send(`Created by ${names}`);
  } else if (req.params.type === 'pennkey') {
    res.send(`Created by ${pennKeys}`)
  } else {
    // we can also send back an HTTP status code to indicate an improper request
    res.status(400).send(`'${req.params.type}' is not a valid author type. Valid types are 'name' and 'pennkey'.`);
  }
}

module.exports = {author}