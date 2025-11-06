import Link from "next/link";
import { siteConfig } from "@/src/lib/site.config";

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold hover:text-gray-600 transition">
          {siteConfig.name}
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link className="hover:underline hover:text-gray-600 transition" href="/crawlers">
            Crawlers
          </Link>
          <Link className="hover:underline hover:text-gray-600 transition" href="/tutorials">
            Tutorials
          </Link>
          <a
            className="hover:underline hover:text-gray-600 transition"
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
