export default function Table(props) {

    const roundIfNumber = (val) => {
        if (typeof val !== 'number') {
            return val
        }
        return Math.round(val * 100) / 100
    }

    return (
        <table>
            <thead>
                <tr>
                    {
                        props.schema.map(([headerName, _], index) => (
                            <th key={index}><p className="emphasis">{headerName}</p></th>
                        )) 
                    }
                </tr>
            </thead>
            <tbody>
            {
                props.data.map((row, index) => (
                    <tr key={index}>
                        {
                            props.schema.map(([_, headerKey], index) => (
                                <td key={index}><p>{roundIfNumber(row[headerKey])}</p></td>
                            ))
                        }
                    </tr>
                ))
            }
            </tbody>
        </table>
    )
}