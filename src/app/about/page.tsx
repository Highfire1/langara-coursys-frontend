export const metadata = {
    title: "About The Langara Course Planner",
    description: "A web application to explore courses at Langara College. Search by attribute, transfer destinations, and more.",
};

import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import Link from "next/link";

export default function Home() {
    return (
        <div className="w-full h-full bg-gray-300">
            <Header title="About the Langara Course Planner" color="#9ca3af  " />

            <div className="px-2 md:px-20 md:max-w-[1000px] py-6 mx-auto">


            <div className="space-y-8">
                <section>
                <h2 className="text-2xl font-bold mb-3">Why?</h2>
                <p>Because the Langara registration system sucks. I remember my first semester trying to figure out which courses to take, then when I tried to register I had massive time conflicts and prerequisite issues. You could chalk this up to a skill issue but I know I can&apos;t have been the only one.</p>
                <p>Also, as a computer science student, this entire project has also been a great learning opportunity on how to build software that people will actually want to use.</p>
                </section>

                <section>
                <h2 className="text-2xl font-bold mb-3">How long has this been in development?</h2>
                <p>The first version of the website went live on October 24th, 2023. Development has continued ever since, and we are now on the third version of this website.</p>
                </section>

                <section>
                <h2 className="text-2xl font-bold mb-3">Where is the data sourced?</h2>
                <p>The data is sourced from several Langara websites, as well as the BCTransferGuide.</p>
                <p>Data for the most recent semester is updated hourly, and all other data is updated daily.</p>
                <p>I hope to add more ways to audit this in the future. If you see any issues with the data, please reach out to me directly on discord.</p>
                </section>

                <section>
                <h2 className="text-2xl font-bold mb-3">How was this website built?</h2>
                <p>Frontend: Next.js, Tailwind, some components including FullCalendar and shadcn.</p>
                <p>Backend: Python, bs4, Selenium, FastAPI, Scalar</p>
                <p>This project is entirely free and <Link href="https://github.com/Highfire1/LangaraCoursePlanner" target="_blank" className="hover:underline text-blue-800">open source</Link>. If you are interested in contributing please reach out.</p>
                </section>

                <section>
                <h2 className="text-2xl font-bold mb-3">Can I use the data in my own project?</h2>
                <p>Yes, you can.</p>
                <p>Data is freely available through a REST API at <Link href="http://168.138.79.49:5010" target="_blank" className="hover:underline text-blue-800">coursesapi.langaracs.ca</Link>.</p>
                <p>Let me know if you create something using the API so that I can advertise it.</p>
                </section>

                <section>
                <h2 className="text-2xl font-bold mb-3">Who are you?</h2>
                <p>I am just someone who wants to make a bit of change in this world.</p>
                <p>You can learn more about me at <Link href="https://andersontseng.ca" target="_blank" className="hover:underline text-blue-800">andersontseng.ca</Link>.</p>
                </section>
            </div>
            </div>

            <Footer></Footer>

        </div>
    );
}
