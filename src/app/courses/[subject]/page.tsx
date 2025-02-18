import { redirect } from 'next/navigation'

type Params = Promise<{ subject: string }>

// TODO: i think this violates html best practices
// but i don't want to leave it as a 404
// and /courses has all the information that a /courses/[subject] would have
export default async function CoursePage({ params }: { params: Params }) {
    const { subject } = await params
    redirect(`/courses?subject=${subject.toUpperCase()}`)
}