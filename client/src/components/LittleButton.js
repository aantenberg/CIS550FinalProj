export default function LittleButton(props) {
    return (
        <div className='little-button' onClick={props.onClick} style={{ cursor: 'pointer', pointerEvents: (props.disabled ? 'none' : 'auto'), opacity: props.disabled ? 0.6 : undefined, ...props.style }}>
            <p className="emphasis" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{props.label}</p>
        </div>
    )
}