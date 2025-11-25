import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "THE AGENCY", href: "#agency" },
    { label: "TALENT", href: "#talent" },
    { label: "TALENT HUB", href: "/auth" },
    { label: "CONTACT", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="font-display text-2xl tracking-wider text-foreground hover:text-neon transition-colors">
            THE FORJ
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-12">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.href.startsWith('/') ? (
                  <Link
                    to={item.href}
                    className="font-display text-lg tracking-wider text-foreground hover:text-neon transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-neon transition-all duration-300 group-hover:w-full" />
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="font-display text-lg tracking-wider text-foreground hover:text-neon transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-neon transition-all duration-300 group-hover:w-full" />
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center space-y-1.5"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-[2px] bg-foreground transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-[2px] bg-foreground transition-all ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-[2px] bg-foreground transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-carbon/95 backdrop-blur-lg border-t border-metal">
            <ul className="py-6 space-y-4">
              {navItems.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-6 py-3 font-display text-xl tracking-wider text-foreground hover:text-neon hover:bg-metal/50 transition-all"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-6 py-3 font-display text-xl tracking-wider text-foreground hover:text-neon hover:bg-metal/50 transition-all"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
