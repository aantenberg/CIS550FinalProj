export default function Table(props) {
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
                                <td><p>{row[headerKey]}</p></td>
                            ))
                        }
                    </tr>
                ))
            }
        </table>
    )
}