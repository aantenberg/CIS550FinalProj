export default function Table(props) {

    const roundIfNumber = (val) => {
        if (typeof val !== 'number') {
            return val
        }
        return Math.round(val * 100) / 100
    }

    return (
        <table>
            <tr>
                {
                    props.schema.map(([headerName, _]) => (
                        <th><p className="emphasis">{headerName}</p></th>
                    )) 
                }
            </tr>
            {
                props.data.map(row => (
                    <tr>
                        {
                            props.schema.map(([_, headerKey]) => (
                                <td><p>{roundIfNumber(row[headerKey])}</p></td>
                            ))
                        }
                    </tr>
                ))
            }
        </table>
    )
}