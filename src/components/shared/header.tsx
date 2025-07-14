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
        <div className="h-10 bg-orange-200 border-b shadow-sm px-4 pt-2 pb-1 flex flex-row items-end space-x-2 align-bottom whitespace-nowrap overflow-x-scroll" style={{ backgroundColor: color }}>
            <Link href={navigateTo}>
                <h1 className="text-lg font-bold">{title}</h1>
            </Link>

            <p className="text-gray-800 pb-[2px]">This website is a student project and is not affiliated with Langara College.</p>

            {!hideForm && (
                <p className="text-gray-800 pb-[2px]">
                    Please report bugs or feedback at{" "}
                    <Link
                        href="https://forms.gle/CYKP7xsp2an6gNEK9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        this form
                    </Link>!
                </p>
            )}
        </div>
    );
};

export default Header;
