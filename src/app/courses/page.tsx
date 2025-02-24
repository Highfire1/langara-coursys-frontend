export const metadata = {
  title: "Langara Course Search",
  description: "A web application to explore courses at Langara College. Search by attribute, transfer destinations, and more.",
};

import CourseBrowser from "./course-browser";
import { Suspense } from "react";
import Header from "@/components/shared/header";

export default function Home() {
  return (
    <div className="w-full h-full">
      <Header title="Langara Course Search" color="#F1B5CB"/>

      <div className="md:px-10">
        
        {/* I don't understand why suspense is required here
        next.js requires it when using useSearchParams, but i don't understand why it can't just handle it... */}
        <Suspense fallback={<div>Loading...</div>}>
          <CourseBrowser />
        </Suspense>
      </div>

    </div>
  );
}
