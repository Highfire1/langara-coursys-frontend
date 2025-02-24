export const metadata = {
  title: "Langara Course Search",
  description: "A web application to explore courses at Langara College. Search by attribute, transfer destinations, and more.",
};

import CourseBrowser from "./course-browser";
import { Suspense } from "react";
import Header from "@/components/shared/header";


export const revalidate = 3600 // revalidate every hour




export default async function Home() {
  const [transfersRes, subjectsRes] = await Promise.all([
    fetch('https://coursesapi.langaracs.ca/v1/index/transfer_destinations'),
    fetch('https://coursesapi.langaracs.ca/v1/index/subjects')
  ]);

  const [transfersData, subjectsData] = await Promise.all([
    transfersRes.json(),
    subjectsRes.json()
  ]);

  const transfers = transfersData.transfers;
  const subjects = subjectsData.subjects;
  
  return (
    <div className="w-full h-full">
      <Header title="Langara Course Search" color="#F1B5CB" />

      <div className="md:px-10">
        <Suspense fallback={<div>Loading...</div>}>
          <CourseBrowser transfers={transfers} subjects={subjects} />
        </Suspense>
      </div>
    </div>
  );
}