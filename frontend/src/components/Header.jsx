export default function Header() {
    return (
        <header className="bg-gradient-to-br from-purple-300 via-blue-200 to-purple-200 py-3 px-8 flex items-center">
            {/* Logo on the left */}
            <div className="flex-none">
                <img
                    src="/UCLA_Orsulic_Lab_Logo.png"
                    alt="UCLA Orsulic Lab Logo"
                    className="h-12 w-auto"
                />
            </div>

            {/* Title on the right */}
            <div className="flex-1 text-center">
                <h1 className="font-futura text-4xl font-bold tracking-wider leading-tight" style={{ color: '#4338ca' }}>
                    Cell Line Database
                </h1>
            </div>

            {/* Empty placeholder to balance the flex so the title stays centered */}
            <div className="flex-none w-12" />
        </header>
    );
}
