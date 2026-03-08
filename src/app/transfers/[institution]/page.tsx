import { notFound } from "next/navigation";
import Header from "@/components/shared/header";
import TransferTable from "@/app/transfers/[institution]/TransferTable";

interface Transfer {
  id: number;
  sourceId?: number;
  source: string;
  sourceCredits: number;
  sourceTitle: string;
  destination: string;
  destinationName: string | null;
  credit: string;
  condition: string | null;
  effectiveStart: string;
  effectiveEnd: string | null;
  subject: string;
  courseNumber: string;
}

interface TransferResponse {
  transfers: Transfer[];
}

type ExpectedParams = Promise<{ institution: string }>;

export async function generateMetadata({ params }: { params: ExpectedParams }) {
  const { institution } = await params;
  
  return {
    title: `Transfer Credits - ${institution.toUpperCase()}`,
    description: `View transfer credit agreements between Langara College and ${institution.toUpperCase()}`,
  };
}

export default async function InstitutionTransfersPage({ params }: { params: ExpectedParams }) {
  const { institution } = await params;
  
  // Fetch transfer data
  const response = await fetch(`https://api2.langaracourses.ca/api/v3/transfers/${institution.toUpperCase()}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch transfers: ${response.status}`);
  }

  const data: TransferResponse = await response.json();

  // the api kind of sucks and doesn't 404
  if (data.transfers.length === 0) {
    notFound();
  }

  // Split transfers into active and inactive
  const now = new Date();
  const currentDateString = now.getFullYear().toString() + 
    (now.getMonth() + 1).toString().padStart(2, '0') + 
    now.getDate().toString().padStart(2, '0');

  // Calculate date 5 years ago
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(now.getFullYear() - 5);
  const fiveYearsAgoString = fiveYearsAgo.getFullYear().toString() + 
    (fiveYearsAgo.getMonth() + 1).toString().padStart(2, '0') + 
    fiveYearsAgo.getDate().toString().padStart(2, '0');

  const activeTransfers = data.transfers.filter(transfer => 
    !transfer.effectiveEnd || transfer.effectiveEnd >= currentDateString
  );
  
  const recentlyEndedTransfers = data.transfers.filter(transfer => 
    transfer.effectiveEnd && 
    transfer.effectiveEnd < currentDateString && 
    transfer.effectiveEnd >= fiveYearsAgoString
  );

  const oldEndedTransfers = data.transfers.filter(transfer => 
    transfer.effectiveEnd && transfer.effectiveEnd < fiveYearsAgoString
  );

  // Sort transfers by subject and course code
  const sortedActiveTransfers = activeTransfers.sort((a, b) => {
    const aKey = `${a.subject} ${a.courseNumber}`;
    const bKey = `${b.subject} ${b.courseNumber}`;
    return aKey.localeCompare(bKey);
  });

  const sortedRecentlyEndedTransfers = recentlyEndedTransfers.sort((a, b) => {
    const aKey = `${a.subject} ${a.courseNumber}`;
    const bKey = `${b.subject} ${b.courseNumber}`;
    return aKey.localeCompare(bKey);
  });

  const sortedOldEndedTransfers = oldEndedTransfers.sort((a, b) => {
    const aKey = `${a.subject} ${a.courseNumber}`;
    const bKey = `${b.subject} ${b.courseNumber}`;
    return aKey.localeCompare(bKey);
  });

  return (
    <div className="w-full h-full">
      <Header title="Transfer Credits" color="#A7C7E7" navigateTo="/transfers"/>
      
      <div className="px-4 md:px-10 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Transfer Credits to {data.transfers[0]?.destinationName || institution.toUpperCase()}
          </h1>
          <p className="text-gray-600">
            Found {data.transfers.length} transfer agreement{data.transfers.length !== 1 ? 's ' : ' '} 
            ({activeTransfers.length} active, {recentlyEndedTransfers.length} ended in last 5 years, {oldEndedTransfers.length} ended more than 5 years ago).
          </p>
        </div>

        {data.transfers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No transfer agreements found for {institution.toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <TransferTable 
              transfers={sortedActiveTransfers}
              title="Active Transfer Agreements"
            />
            
            <TransferTable 
              transfers={sortedRecentlyEndedTransfers}
              title="Recently Ended Transfer Agreements (Last 5 Years)"
              isInactive={true}
              openByDefault={sortedActiveTransfers.length === 0}
            />

            <TransferTable 
              transfers={sortedOldEndedTransfers}
              title="Old Transfer Agreements (Ended More Than 5 Years Ago)"
              isInactive={true}
              openByDefault={false}
            />
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> Transfer credit information is subject to change. 
            Please consult with an academic advisor or the receiving institution for the most current transfer requirements and policies.
          </div>
        </div>
      </div>
    </div>
  );
}
