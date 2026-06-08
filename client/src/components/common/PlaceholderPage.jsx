import { Link } from "react-router-dom";

export default function PlaceholderPage({ title, description }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Coming soon
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-4 text-slate-600">
        {description || "This page is scaffolded and ready for frontend work."}
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Back to home
      </Link>
    </section>
  );
}
