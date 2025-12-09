const Agency = () => {
  return (
    <section id="agency" className="relative min-h-screen py-32">
      {/* Concrete Texture Background */}
      <div className="absolute inset-0 concrete-texture" />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-carbon/80 via-transparent to-carbon/80" />
      
      {/* Orange Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground leading-none">
                THE
                <br />
                <span className="text-neon">AGENCY</span>
              </h2>
              <div className="w-32 h-1 bg-neon" />
            </div>

            <div className="space-y-6 font-mono text-base md:text-lg text-muted-foreground max-w-2xl">
              <p className="leading-relaxed">
                THE FORJ OFFICIAL is not just an agency—it's a{" "}
                <span className="text-neon font-bold">forge</span> where raw talent is shaped into fashion icons.
              </p>
              
              <p className="leading-relaxed">
                We blend <span className="text-gold font-bold">brutal sophistication</span> with underground culture, 
                creating a new standard in the modeling industry. Our approach is direct, uncompromising, and built 
                for the next generation.
              </p>

              <p className="leading-relaxed">
                From high fashion runways to editorial spreads, we represent models who embody{" "}
                <span className="text-foreground font-bold">strength, authenticity, and raw presence</span>.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-metal">
              <div>
                <div className="font-display text-4xl md:text-5xl text-neon mb-2">50+</div>
                <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">TALENT</div>
              </div>
              <div>
                <div className="font-display text-4xl md:text-5xl text-neon mb-2">100+</div>
                <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">CAMPAIGNS</div>
              </div>
              <div>
                <div className="font-display text-4xl md:text-5xl text-neon mb-2">24/7</div>
                <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">FORGING</div>
              </div>
            </div>
          </div>

          {/* Visual Side - Gold Silhouette Element */}
          <div className="relative hidden lg:block animate-fade-in animation-delay-300">
            <div className="relative aspect-square">
              {/* Industrial Frame */}
              <div className="absolute inset-0 border-2 border-metal" />
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-gold" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-gold" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-gold" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-gold" />
              
              {/* Placeholder for Golden Silhouette */}
              <div className="absolute inset-8 bg-gradient-to-br from-gold/20 to-transparent backdrop-blur-sm flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-gold animate-glow-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Agency;
