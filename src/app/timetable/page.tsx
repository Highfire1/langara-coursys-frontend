
// export const metadata = {
//   title: "Langara Timetable Generator",
//   description: "Explore all possible combinations of a list of selected courses.",
// };

import { Suspense } from 'react';
import Header from '@/components/shared/header';
import Composer from './composer';


export default function Page() {
  return (
    <div className="h-[100vh] flex flex-col">
      <Header title="Langara Timetable Generator" color="#b38cb3" />

      <Suspense fallback={<div>Loading search parameters...</div>}>
        <Composer/>
      </Suspense>
    </div>
  );
}
