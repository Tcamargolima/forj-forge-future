const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 bg-carbon">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay for Transparency Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-carbon/70 via-carbon/50 to-carbon/70" />
        
        {/* Concrete Texture Overlay */}
        <div className="absolute inset-0 concrete-texture opacity-20" />
        
        {/* Neon Orange Accent Lines */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-neon to-transparent opacity-60" />
        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-neon to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-8xl md:text-[12rem] lg:text-[16rem] leading-none tracking-wider text-foreground text-industrial">
            THE FORJ
          </h1>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-neon blur-xl opacity-30" />
            <p className="relative font-display text-xl md:text-3xl tracking-[0.3em] text-neon">
              OFFICIAL
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="mt-12 animate-fade-in animation-delay-300">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-8">
            FORGING THE FUTURE
            <br />
            <span className="text-neon">OF FASHION</span>
          </h2>
          
          {/* CTA Button */}
          <button 
            onClick={() => {
              document.getElementById('talent-section')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="group relative px-12 py-4 bg-transparent border-2 border-neon overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer"
          >
            <span className="relative z-10 font-display text-xl tracking-wider text-neon group-hover:text-carbon transition-colors duration-500">
              DISCOVER TALENT
            </span>
            <div className="absolute inset-0 bg-neon transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[2px] h-16 bg-gradient-to-b from-neon to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
