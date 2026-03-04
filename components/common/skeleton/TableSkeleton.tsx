export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-10 py-7">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
            </div>
          </td>

          <td className="px-10 py-7">
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </td>

          <td className="px-10 py-7">
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </td>

          <td className="px-10 py-7">
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
          </td>

          <td className="px-10 py-7">
            <div className="space-y-2">
              <div className="h-2 w-32 bg-gray-200 rounded" />
              <div className="h-2 w-24 bg-gray-100 rounded" />
            </div>
          </td>

          <td className="px-10 py-7 text-right">
            <div className="flex justify-end gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};
