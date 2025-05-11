import './Header.css';

export default function Header() {
    return (
        <header className="custom-header">
            <div className="logo-container">
                <img
                    src="/UCLA_Orsulic_Lab_Logo.png"
                    alt="UCLA Orsulic Lab Logo"
                    className="logo-img"
                />
            </div>
            <div className="title-container">
                <h1 className="header-title">Cell Line Database</h1>
            </div>
        </header>
    );
}
