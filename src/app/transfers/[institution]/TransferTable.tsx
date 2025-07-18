'use client'

import Link from "next/link";

interface Transfer {
    id: string;
    source: string;
    source_credits: string;
    source_title: string;
    destination: string;
    destination_name: string;
    credit: string;
    condition: string | null;
    effective_start: string;
    effective_end: string | null;
    subject: string;
    course_code: string;
}

interface TransferTableProps {
    transfers: Transfer[];
    title: string;
    isInactive?: boolean;
    openByDefault?: boolean;
}

export default function TransferTable({ transfers, title, isInactive = false, openByDefault = false }: TransferTableProps) {
    const formatDate = (dateString: string) => {
        return new Date(
            dateString.slice(0, 4) + '-' +
            dateString.slice(4, 6) + '-' +
            dateString.slice(6, 8)
        ).toLocaleDateString();
    };

    const getTransferRowBgColor = (transfer: Transfer, tintred:boolean=false): string => {
        // No credit cases
        if (transfer.credit === "No Credit" || transfer.credit === "No credit") {
            return 'bg-red-200 hover:bg-red-300';
        }

        if (transfer.credit.includes('=')) {
            // Handle cases like "LANG CPSC 1150 (3) & LANG CPSC 1160 (3) = UNBC CPSC 100 (4) & UNBC CPSC 1XX (2)"
            const [leftSide, rightSide] = transfer.credit.split('=').map(s => s.trim());
            const leftCredits = (leftSide.match(/\((\d+)\)/g) || [])
                .map(n => parseInt(n.replace(/[()]/g, '')))
                .reduce((a, b) => a + b, 0);
            const rightCredits = (rightSide.match(/\((\d+)\)/g) || [])
                .map(n => parseInt(n.replace(/[()]/g, '')))
                .reduce((a, b) => a + b, 0);
            return rightCredits < leftCredits ? 'bg-yellow-200 hover:bg-yellow-300' : tintred ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-50';
        } else {
            // Handle cases like "UBCV CPSC_V 1st (3)"
            const creditMatch = transfer.credit.match(/\((\d+)\)/);
            const destinationCredits = creditMatch ? parseInt(creditMatch[1]) : 0;
            const sourceCredits = parseInt(transfer.source_credits);
            return destinationCredits < sourceCredits ? 'bg-yellow-200 hover:bg-yellow-300' : tintred ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-50';
        }
    };

    if (transfers.length === 0) return null;

    const tableContent = (
        <div className="overflow-x-auto bg-white rounded-lg shadow border w-full">
            <table className="min-w-full table-fixed">
                <colgroup>
                    <col className="w-[30%]" />
                    <col className="w-[5%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Langara Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transfer Credit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Effective Period
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {transfers.map(transfer => (
                        <tr key={transfer.id} className={`${getTransferRowBgColor(transfer, isInactive)}`}> 
                            <td className="px-6 py-2">
                                <Link
                          href={`/courses/${transfer.subject.toLowerCase()}-${transfer.course_code.toLowerCase()}`}
                          className="text-black hover:text-[#f15a22] underline"
                          target="_blank"
                        >
                          <span className="font-medium">{`${transfer.subject} ${transfer.course_code}`}</span>
                          {transfer.source_title && (
                            <span className="text-gray-500 hover:text-[#f15a22]">{`: ${transfer.source_title}`}</span>
                          )}
                        </Link>
                            </td>
                            <td className="px-6 py-2 text-sm text-gray-900">
                                {transfer.source_credits}
                            </td>
                            <td className="px-6 py-2">
                                <div className="text-sm text-gray-900">
                                    {transfer.credit}
                                </div>
                            </td>
                            <td className="px-6 py-2">
                                <div className="text-sm text-gray-900">
                                    {transfer.condition || '-'}
                                </div>
                            </td>
                            <td className="px-6 py-2 text-sm text-gray-500">
                                <div>
                                    {formatDate(transfer.effective_start)}
                                </div>
                                {transfer.effective_end && (
                                    <div className={`text-xs ${isInactive ? 'text-red-600' : ''}`}>
                                        to {formatDate(transfer.effective_end)}
                                    </div>
                                )}
                                {!transfer.effective_end && (
                                    <div className="text-xs text-gray-500">
                                        to present.
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (isInactive) {
        return (
            <details open={openByDefault}>
                <summary className="text-xl font-semibold text-gray-900 mb-4 cursor-pointer">
                    {title} ({transfers.length}) - Click to expand
                </summary>
                <div className="overflow-x-auto pt-2">
                    <p className="mb-4 text-sm text-gray-600">
                        Note: If you took courses within the period stated below, you can still transfer those credits.
                    </p>
                    {tableContent}
                    <div className="mt-2 text-sm text-gray-500">
                        * These transfer agreements are no longer active
                    </div>
                </div>
            </details>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {title} ({transfers.length})
            </h2>
            {tableContent}
        </div>
    );
}
