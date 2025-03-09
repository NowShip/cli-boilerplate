"use client";

import Image from "next/image";
import Link from "next/link";
import { usePlausible } from "next-plausible";

const links = [
  { href: "/analytics", label: "Analytics" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
  { href: "/analytics/dashboard", label: "Analytics Dashboard" },
];

export default function Home() {
  const plausible = usePlausible();

  return (
    <div className="flex flex-col gap-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="plausible-event-name=click-link"
        >
          {link.label}
        </Link>
      ))}
      <button
        className="hover:bg-red-600"
        onClick={() => plausible("click-testing")}
      >
        Click me
      </button>
    </div>
  );
}
