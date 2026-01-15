import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Agency from "@/components/Agency";
import Talent from "@/components/Talent";
import Footer from "@/components/Footer";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";

const Index = () => {
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    // Check if user has already submitted or seen the form this session
    const hasSubmitted = localStorage.getItem("leadFormSubmitted");
    const hasSeenThisSession = sessionStorage.getItem("leadFormSeen");
    
    if (!hasSubmitted && !hasSeenThisSession) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowLeadModal(true);
        sessionStorage.setItem("leadFormSeen", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleModalClose = (open: boolean) => {
    setShowLeadModal(open);
  };

  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Agency />
        <Talent />
      </main>
      <Footer />
      <LeadCaptureModal open={showLeadModal} onOpenChange={handleModalClose} />
    </div>
  );
};

export default Index;
