export const metadata = {
  title: "Langara Course Offerings Search",
  description: "A web application to search and explore Langara College course offerings",
};

import CourseBrowser from "./offering-browser";
import Header from "@/components/shared/header";

export default function Home() {
  return (
    <div className="w-full h-full">
      <Header title="Langara Course Offerings Search" color="#FEB95F"></Header>

      <div className="md:px-10">
        <CourseBrowser/>
      </div>
      
    </div>
  );
}
