import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Agency from "@/components/Agency";
import Talent from "@/components/Talent";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Agency />
        <Talent />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
