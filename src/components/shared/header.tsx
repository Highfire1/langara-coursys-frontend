import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    title: string;
    color?: string;
    navigateTo?: string;
    hideForm?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, color = '#D3D3D3', navigateTo = '/', hideForm = false }) => {
    return (
        <header className="w-full px-5 py-2 shadow-md" style={{ backgroundColor: color }}>
            <Link href={navigateTo}>
                <h1 className="font-bold text-xl m-0">
                    {title}
                </h1>
            </Link>
            <p>Note: this website is a student project and is not affiliated with Langara College.</p>
            {!hideForm && (
                <p>Suggestions? Feedback? Found a bug? Please send a report through <a className="text-blue-800 hover:text-blue-600 underline" href="https://forms.gle/CYKP7xsp2an6gNEK9" target="_blank">this form.</a></p>
            )}
        </header>
    );
};

export default Header;
