import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavItem {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  items?: { title: string; url: string }[];
}

interface NavMainProps {
  items: NavItem[];
}

export default function NavMain({ items }: NavMainProps) {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <nav className="space-y-2">
      {items.map((item) => (
        <div key={item.title}>
          <button
            onClick={() => {
              if (item.items) {
                toggleItem(item.title);
              } else {
                navigate(item.url);
              }
            }}
            className={`flex items-center w-full text-left px-4 py-2 rounded-md transition-colors ${
              item.isActive ? "bg-blue-700" : "hover:bg-blue-700"
            }`}
          >
            {item.icon && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={item.icon}
                />
              </svg>
            )}
            {item.title}
            {item.items && (
              <svg
                className={`w-4 h-4 ml-auto transform ${openItems.includes(item.title) ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
          {item.items && openItems.includes(item.title) && (
            <div className="ml-6 mt-1 space-y-1">
              {item.items.map((subItem) => (
                <button
                  key={subItem.title}
                  onClick={() => navigate(subItem.url)}
                  className="flex items-center w-full text-left px-4 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  {subItem.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}