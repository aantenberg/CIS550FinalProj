const { connection } = require('./routesCore')

// GET: /location
// Return Schema: [{ latitude: float, longitude: float }]
const locationForZipcode = async function (req, res) {

    const zipcode = req.query.zipcode

    if (!zipcode || !Number(zipcode)) {
        res.status(400).send('Required query parameter zipcode must be an integer')
        return
    }

    connection.query(`  
    SELECT latitude, longitude
    FROM ZipCodeInfo
    WHERE zipcode = ${zipcode};
    `, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else if (data.length && data.length > 0) {
            res.json(data[0]);
        } else {
            res.json({})
        }
    });
}

module.exports = {
    locationForZipcode
}