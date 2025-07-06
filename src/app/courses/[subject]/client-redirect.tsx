'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ClientRedirectProps {
    subject: string
}

export default function ClientRedirect({ subject }: ClientRedirectProps) {
    const router = useRouter()

    useEffect(() => {
        router.replace(`/courses?subject=${subject.toUpperCase()}`)
    }, [router, subject])

    // Optional: show a loading state while redirecting
    return <div>Redirecting...</div>
}
