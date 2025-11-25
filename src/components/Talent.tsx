const Talent = () => {
  const models = [
    {
      id: 1,
      name: "ARIA STEEL",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      category: "HIGH FASHION",
    },
    {
      id: 2,
      name: "MARCUS VOLT",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
      category: "EDITORIAL",
    },
    {
      id: 3,
      name: "LUNA FORGE",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop",
      category: "RUNWAY",
    },
    {
      id: 4,
      name: "ZANE CARBON",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
      category: "STREETWEAR",
    },
    {
      id: 5,
      name: "NOVA IRON",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
      category: "HIGH FASHION",
    },
    {
      id: 6,
      name: "REX METAL",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
      category: "EDITORIAL",
    },
  ];

  return (
    <section id="talent-section" className="relative min-h-screen py-32 bg-carbon">
      {/* Orange Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        {/* Section Header */}
        <div className="mb-20 text-center animate-fade-in">
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground mb-4">
            THE <span className="text-neon">CASTING</span>
          </h2>
          <p className="font-mono text-muted-foreground text-lg tracking-wider">
            FORGED FOR GREATNESS
          </p>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <div
              key={model.id}
              className={`group relative overflow-hidden industrial-border animate-fade-in ${
                index === 2 || index === 4 ? "lg:translate-y-12" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-metal">
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 grayscale"
                  loading="lazy"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                
                {/* Neon Glow Border on Hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-neon transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(255,69,0,0.6)]" />
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-carbon/90 backdrop-blur-sm border-t-2 border-neon p-4">
                  <h3 className="font-display text-3xl text-foreground mb-1 tracking-wider">
                    {model.name}
                  </h3>
                  <p className="font-mono text-sm text-neon tracking-widest">
                    {model.category}
                  </p>
                </div>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-20 text-center">
          <button className="group relative px-16 py-5 bg-transparent border-2 border-foreground overflow-hidden transition-all duration-500 hover:border-neon hover:scale-105">
            <span className="relative z-10 font-display text-2xl tracking-wider text-foreground group-hover:text-carbon transition-colors duration-500">
              VIEW ALL CASTING
            </span>
            <div className="absolute inset-0 bg-neon transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Talent;
