export default function Paid() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg border bg-green-50/50 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">Premium Access Active</h3>
          <p className="text-muted-foreground text-sm">
            All premium features are now unlocked
          </p>
        </div>
      </div>
      <div className="rounded-lg border px-3 py-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg
              className="h-3.5 w-3.5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Unlimited Projects
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg
              className="h-3.5 w-3.5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            No Watermarks
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg
              className="h-3.5 w-3.5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Unlimited Users
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg
              className="h-3.5 w-3.5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Advanced Permissions
          </div>
        </div>
      </div>
    </div>
  );
}
