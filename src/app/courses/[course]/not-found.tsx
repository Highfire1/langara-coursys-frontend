import Header from "@/components/shared/header";

// searchparams doesn't work in 404 pages
// type expectedParams = Promise<{ subject: string; coursecode: string }>;

// export default async function NotFound({
//     params: searchParams
// }: {
//     params: expectedParams
// }
// ) {
//     console.log(searchParams)
//     const { subject, coursecode: coursecode } = await searchParams;

//     return (
//         <div className="w-full h-full">
//             <Header title="Langara Course Information" color="#A7C7E7"></Header>

//             <div className="md:px-10 py-2">404: {subject} {coursecode} does not exist.</div>
//         </div>
//     )
// }

export default function NotFound() {
    return (
        <div className="w-full h-full">
            <Header title="Langara Course Information" color="#A7C7E7"></Header>

            <div className="md:px-10 py-2">404: this course does not exist.</div>
        </div>
    )
}