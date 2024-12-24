export function Pagination({ 
  currentPage, 
  totalPages,
  onChange 
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  // Show maximum 3 pages on each side of current page
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Add ellipsis after first page if needed
    if (currentPage > 4) {
      pages.push('...');
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - 2); 
         i <= Math.min(totalPages - 1, currentPage + 2); 
         i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed 
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex gap-2 items-center justify-center mt-4">
      {getPageNumbers().map((pageNum, i) => (
        <button
          key={i}
          onClick={() => typeof pageNum === 'number' && onChange(pageNum)}
          className={`
            px-3 py-1 rounded
            ${typeof pageNum === 'number' 
              ? pageNum === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300' 
              : 'cursor-default'
            }
          `}
          disabled={typeof pageNum === 'string'}
        >
          {pageNum}
        </button>
      ))}
    </div>
  );
}