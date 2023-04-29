import { Link } from "react-router-dom";

export default function Header() {
    return (
        <div className='navbar-container'>
            <Link to={"/"} className="grow-animated undecorated-link">
                <h2>Food Find</h2>
            </Link>
            <Link to={"/state-rankings/home"} className="underline-animated undecorated-link margin-left-32">
                <h4 style={{ color: "var(--white)" }}>State Info</h4>
            </Link>
            <Link to={"/analyze/home"} className="underline-animated undecorated-link margin-left-32">
                <h4 style={{ color: "var(--white)" }}>Analyze</h4>
            </Link>
        </div>
    )
}