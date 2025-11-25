const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "INSTAGRAM", href: "https://www.instagram.com/theforjofficial/" },
    { name: "FACEBOOK", href: "https://www.facebook.com/theforj" },
    { name: "TIKTOK", href: "https://www.tiktok.com/@theforjofficial" },
  ];

  return (
    <footer id="contact" className="relative bg-metal border-t-2 border-neon">
      {/* Neon Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-neon shadow-[0_0_20px_rgba(255,69,0,0.6)]" />

      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-5xl text-foreground tracking-wider mb-2">
                THE FORJ
              </h3>
              <p className="font-display text-xl text-neon tracking-[0.3em]">
                OFFICIAL
              </p>
            </div>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
              FORGING THE FUTURE OF FASHION. ELITE MODELING AGENCY.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-2xl text-foreground mb-6 tracking-wider">
              NAVIGATE
            </h4>
            <ul className="space-y-3 font-mono text-sm">
              <li>
                <a
                  href="#agency"
                  className="text-muted-foreground hover:text-neon transition-colors inline-block hover:translate-x-1 duration-300"
                >
                  THE AGENCY
                </a>
              </li>
              <li>
                <a
                  href="#talent"
                  className="text-muted-foreground hover:text-neon transition-colors inline-block hover:translate-x-1 duration-300"
                >
                  TALENT
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-muted-foreground hover:text-neon transition-colors inline-block hover:translate-x-1 duration-300"
                >
                  CONTACT
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-2xl text-foreground mb-6 tracking-wider">
              CONTACT
            </h4>
            <ul className="space-y-3 font-mono text-sm text-muted-foreground">
              <li>
                <a 
                  href="mailto:info@theforjofficial.com"
                  className="hover:text-neon transition-colors"
                >
                  INFO@THEFORJOFFICIAL.COM
                </a>
              </li>
              <li>
                <a 
                  href="https://www.theforjofficial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon transition-colors"
                >
                  WWW.THEFORJOFFICIAL.COM
                </a>
              </li>
              <li className="pt-2">
                WORLDWIDE
                <br />
                UNDERGROUND HQ
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-2xl text-foreground mb-6 tracking-wider">
              NEWSLETTER
            </h4>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="YOUR@EMAIL.COM"
                className="w-full bg-transparent border-2 border-metal px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-neon hover:bg-neon/80 text-carbon font-display text-lg tracking-wider py-3 transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-[1px] bg-gradient-to-r from-transparent via-metal to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="font-mono text-xs text-muted-foreground tracking-wider">
            © {currentYear} THE FORJ OFFICIAL. ALL RIGHTS RESERVED.
          </p>

          {/* Social Links */}
          <div className="flex gap-8">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-mono text-xs text-muted-foreground hover:text-neon transition-colors tracking-wider"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Industrial Badge */}
        <div className="mt-12 text-center">
          <div className="inline-block border border-metal px-6 py-2">
            <p className="font-mono text-xs text-muted-foreground tracking-[0.3em]">
              FORGED WITH PRECISION
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
