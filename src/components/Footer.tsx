import { siteConfig } from "@/src/lib/site.config";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 text-sm text-gray-600 mt-16">
      <div className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition"
          >
            GitHub
          </a>
          <a
            href={siteConfig.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition"
          >
            {siteConfig.author.name}
          </a>
        </div>
      </div>
    </footer>
  );
}
