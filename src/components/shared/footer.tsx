import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer className="w-full px-5 py-8 shadow-md bg-slate-400">

            <p>Thank you for using the Langara Course Planner!</p>
            <br></br>
            <p>It would really help us out if you <a className="underline text-blue-800" href="https://forms.gle/CYKP7xsp2an6gNEK9" target="_blank">sent us a testimonial</a> on how this website helped you.</p>
            <p>We are also looking for contributors - check out the repository on <Link href="https://github.com/Highfire1/LangaraCoursePlanner" target='_blank' className='text-blue-800 hover:text-blue-600 underline font-medium'>Github</Link>.</p>
            {/* <p>This project is hosted by the <Link href="https://langaracs.ca" target='_blank' className='text-blue-800 hover:text-blue-600 underline font-medium'>Langara Computer Science Club</Link>.</p> */}
            <br></br>
            <p>Check out more information <Link href="/about" className='text-blue-800 hover:text-blue-600 underline font-medium'>about this website</Link> or information about its <Link href="https://andersontseng.ca" target='_blank' className='text-blue-800 hover:text-blue-600 underline font-medium'>creator</Link>.</p>
        </footer>
    );
};

export default Footer;
