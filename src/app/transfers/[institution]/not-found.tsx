import Link from "next/link";
import Header from "@/components/shared/header";

export default function NotFound() {
  return (
    <div className="w-full h-full">
      <Header title="Transfer Credits" color="#A7C7E7" />
      
      <div className="md:px-10 py-4">
        <div className="text-center py-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Institution Not Found
            </h1>
            <p className="text-gray-600">
              The requested institution could not be found or does not have any transfer agreements with Langara College.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/transfers"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Transfer Institutions
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Looking for a specific institution? Check the full list of available transfer agreements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
