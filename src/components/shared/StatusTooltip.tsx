'use client'

import { useState, useEffect } from 'react';

interface StatusInfo {
    lastUpdated: string;
    sources: { type: string; last_fetched: string; next_fetch: string }[];
    database: { courses: number; sections: number; transfers: number; semesters: number };
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const month = d.toLocaleString('en-US', { month: 'long' });
    const day = d.getDate();
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'pm' : 'am';
    const hour = h % 12 || 12;
    return `${month} ${day} ${hour}:${m}${ampm}`;
}

export default function StatusTooltip() {
    const [status, setStatus] = useState<StatusInfo | null>(null);
    const [timeStr, setTimeStr] = useState('...');
    const [show, setShow] = useState(false);

    useEffect(() => {
        fetch('https://api2.langaracourses.ca/api/v3/status')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                const semSearch = data.sources?.find((s: { type: string }) => s.type === 'SemesterSearch');
                if (!semSearch?.last_fetched) return;
                const info: StatusInfo = {
                    lastUpdated: semSearch.last_fetched,
                    sources: data.sources.map((s: { type: string; last_fetched: string; next_fetch: string }) => ({
                        type: s.type, last_fetched: s.last_fetched, next_fetch: s.next_fetch,
                    })),
                    database: {
                        courses: data.database?.courses ?? 0,
                        sections: data.database?.sections ?? 0,
                        transfers: data.database?.transfers ?? 0,
                        semesters: data.database?.semesters ?? 0,
                    },
                };
                setStatus(info);
                setTimeStr(timeAgo(info.lastUpdated));
            })
            .catch(() => null);
    }, []);

    useEffect(() => {
        if (!status) return;
        const interval = setInterval(() => setTimeStr(timeAgo(status.lastUpdated)), 60000);
        return () => clearInterval(interval);
    }, [status]);

    if (!status) return null;

    return (
        <div
            className="relative flex-shrink-0 pl-2 pb-[2px]"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <span className="text-gray-700 text-sm cursor-default whitespace-nowrap">
                Updated {timeStr}
            </span>

            {show && (
                <div className="absolute right-0 top-6 z-50 bg-white border border-gray-200 rounded shadow-lg p-3 text-sm w-72">
                    <div className="font-semibold mb-2 text-gray-900">Database</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-gray-700">
                        <span>Courses</span><span className="text-right font-mono">{status.database.courses.toLocaleString()}</span>
                        <span>Sections</span><span className="text-right font-mono">{status.database.sections.toLocaleString()}</span>
                        <span>Transfers</span><span className="text-right font-mono">{status.database.transfers.toLocaleString()}</span>
                        <span>Semesters</span><span className="text-right font-mono">{status.database.semesters.toLocaleString()}</span>
                    </div>
                    <div className="font-semibold mb-2 text-gray-900">Sources</div>
                    <div className="space-y-1 text-gray-700">
                        {status.sources.map(s => (
                            <div key={s.type} className="flex justify-between gap-2">
                                <span className="truncate">{s.type}</span>
                                <span className="text-gray-500 whitespace-nowrap">{timeAgo(s.last_fetched)} ({formatDate(s.last_fetched)})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
