"use client";

type TabId = "home" | "about";

type ProfileTabsProps = {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
};

export default function ProfileTabs({
    activeTab,
    onTabChange,
}: ProfileTabsProps) {
    return (
        <div
            className="flex border-b border-border -mb-px"
            role="tablist"
            aria-label="Profile sections"
        >
            <button
                type="button"
                role="tab"
                aria-selected={activeTab === "home"}
                onClick={() => onTabChange("home")}
                className={`px-4 sm:px-0 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "home"
                        ? "text-text-1 border-text-1"
                        : "text-text-2 border-transparent hover:text-text-1"
                    }`}
            >
                Home
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={activeTab === "about"}
                onClick={() => onTabChange("about")}
                className={`px-4 sm:px-4 py-3 text-sm font-normal transition-colors border-b-2 -mb-px ${activeTab === "about"
                        ? "text-text-1 border-text-1 font-medium"
                        : "text-text-2 border-transparent hover:text-text-1"
                    }`}
            >
                About
            </button>
        </div>
    );
}
