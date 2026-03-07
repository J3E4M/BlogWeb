import Link from "next/link";

const POPULAR_ARTICLES = [
    { title: "The Last Programmer — A Short Story About AI", author: "Yuki Tanaka", href: "#" },
    { title: "How I Went From Burnout to Building a Profitable Solo Business", author: "Alex Chen", href: "#" },
    { title: "Climate Tech Is Having Its Moment — Here's What to Watch", author: "Maria Santos", href: "#" },
];

const TOPICS = ["Technology", "Design", "Culture", "Business", "Politics", "Science", "Health", "Writing", "Art", "Music"];

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

const FOOTER_LINKS = [
    { label: "Help", href: "#" },
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
];

export default function Sidebar() {
    return (
        <aside className="w-full lg:w-[296px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-8">
                <section>
                    <h3 className="text-[13px] font-bold text-text-1 mb-4">Popular Articles</h3>
                    <ul className="flex flex-col gap-4">
                        {POPULAR_ARTICLES.map((item, i) => (
                            <li key={i}>
                                <Link href={item.href} className="block group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-5 h-5 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-[10px] font-medium" aria-hidden>{getInitials(item.author)}</span>
                                        <span className="text-xs font-medium text-text-1">{item.author}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-text-1 group-hover:text-primary transition-colors line-clamp-2">{item.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <div className="h-px bg-border" />
                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-3 mb-4">Recommended topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {TOPICS.map((topic) => (
                            <Link key={topic} href={`/topics/${topic.toLowerCase()}`} className="rounded-full bg-surface px-4 py-2 text-sm text-text-2 hover:bg-border hover:text-text-1 transition-colors">
                                {topic}
                            </Link>
                        ))}
                    </div>
                </section>
                <div className="h-px bg-border" />
                <footer className="flex flex-wrap gap-2 text-sm text-text-3">
                    {FOOTER_LINKS.map((link, i) => (
                        <span key={link.label} className="flex items-center gap-2">
                            <Link href={link.href} className="hover:text-text-2 transition-colors">{link.label}</Link>
                            {i < FOOTER_LINKS.length - 1 && <span>·</span>}
                        </span>
                    ))}
                </footer>
            </div>
        </aside>
    );
}
