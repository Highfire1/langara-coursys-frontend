import Link from "next/link";
import Header from "@/components/shared/header";

interface TransferDestination {
  code: string;
  name: string;
}

interface TransferDestinationsResponse {
  transfers: TransferDestination[];
}

export const metadata = {
  title: "Transfer credits from Langara College to other institutions.",
  description: "View transfer credit agreements from Langara College to other institutions",
};

export default async function TransfersPage() {
  // Fetch transfer destinations
  const response = await fetch('https://api.langaracourses.ca/v1/index/transfer_destinations', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transfer destinations: ${response.status}`);
  }

  const data: TransferDestinationsResponse = await response.json();
  
  // Define pinned institutions in alphabetical order
  const pinnedInstitutions = ['SFU', 'TRU', 'UBCO', 'UBCV', 'UFV', 'UVIC'];
  
  // Sort institutions with pinned ones at the top
  const sortedInstitutions = data.transfers.sort((a, b) => {
    const aIsPinned = pinnedInstitutions.includes(a.code);
    const bIsPinned = pinnedInstitutions.includes(b.code);
    
    // If both are pinned or both are not pinned, sort alphabetically
    if (aIsPinned === bIsPinned) {
      return a.name.localeCompare(b.name);
    }
    
    // Pinned institutions come first
    return aIsPinned ? -1 : 1;
  });

  return (
    <div className="w-full h-full">
      <Header title="Transfer Credits" color="#A7C7E7" />
      
      <div className="px-4 md:px-10 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Transfer Credit Agreements from Langara College
          </h1>
          <p className="text-gray-600">
            Langara College has transfer agreements to {data.transfers.length} institution{data.transfers.length !== 1 ? 's' : ''}. 
            Select an institution below to view specific transfer credit information.
          </p>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> You should always double check <Link href="https://www.bctransferguide.ca" className="text-blue-600 underline">BCTransferGuide.ca</Link> for the most accurate and up-to-date information.
            <br/>
            This page only includes outgoing transfer agreements, not inbound transfers to Langara.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedInstitutions.map(institution => (
            <Link
              key={institution.code}
              href={`/transfers/${institution.code.toLowerCase()}`}
              className="block p-6 bg-white rounded-lg shadow border hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex flex-col">
                <div className="text-sm font-medium text-blue-600 mb-1">
                  {institution.code}
                </div>
                <div className="text-lg font-semibold text-gray-900 leading-tight">
                  {institution.name}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}