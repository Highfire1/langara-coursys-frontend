export const metadata = {
  title: "Langara Course Offerings Search",
  description: "A web application to search and explore Langara College course offerings",
};

import CourseBrowser from "./offering-browser";
import Header from "@/components/shared/header";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="w-full h-full">
      <Header title="Langara Course Offerings Search" color="#FEB95F"></Header>

      <div className="md:px-10">
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <CourseBrowser/>
        </Suspense>
      </div>
      
    </div>
  );
}
