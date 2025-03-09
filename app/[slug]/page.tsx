import Link from "next/link";
import React from "react";

type Props = {
  params: {
    slug: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <div>
      <Link href="/">Home</Link>
      <h1>{params.slug}</h1>
    </div>
  );
}
