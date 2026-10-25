import type { Role } from "../App";

const roles: { id: Role; label: string }[] = [
  { id: "admin", label: "Platform Admin" },
  { id: "retailer", label: "Retailer" },
  { id: "media", label: "Media Manager" },
  { id: "airline", label: "Airline" },
  { id: "passenger", label: "Passenger Screen" },
];

export function RoleSwitcher({
  role,
  onChange,
  isAdmin,
}: {
  role: Role;
  onChange: (r: Role) => void;
  isAdmin: boolean;
}) {
  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
      {roles.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={`px-3 py-1.5 text-sm rounded-md transition ${
            role === r.id
              ? "bg-sky-600 text-white shadow"
              : isAdmin
              ? "text-slate-300 hover:bg-slate-700"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}