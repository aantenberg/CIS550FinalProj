import { Link } from "react-router-dom";

export default function Header() {
    return (
        <div className='navbar-container'>
            <Link to={"/"} className="undecorated-link">
                <h2>Food Find</h2>
            </Link>
            <Link to={"/search"} className="undecorated-link margin-left-32">
                <h4 style={{ color: "var(--white)" }}>Search</h4>
            </Link>
        </div>
    )
}