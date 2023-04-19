export default function Table(props) {
    return (
        <table>
            <tr>
                {
                    props.schema.map(header => (
                        <th><p className="emphasis">{header}</p></th>
                    )) 
                }
            </tr>
            {
                props.data.map(row => (
                    <tr>
                        {
                            Object.values(row).map(item => (
                                <td><p>{item}</p></td>
                            ))
                        }
                    </tr>
                ))
            }
        </table>
    )
}