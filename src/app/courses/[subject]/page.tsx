import { redirect } from 'next/navigation'

// TODO: i think this violates html best practices
// but i don't want to leave it as a 404
// and /courses has all the information that a /courses/[subject] would have
export default function CoursePage({ params }: { params: { subject: string } }) {
    redirect(`/courses?subject=${params.subject.toUpperCase()}`)
}