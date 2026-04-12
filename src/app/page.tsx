import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LabHero from '../components/sections/LabHero';
import ToolGallery from '../components/sections/ToolGallery';
import AIFeatures from '../components/sections/AIFeatures';
import ExpertInfo from '../components/sections/ExpertInfo';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-black">
      <Navbar />
      
      {/* Scrollable Content */}
      <div className="flex-grow">
        <LabHero />
        
        <div id="gallery">
          <ToolGallery />
        </div>
        
        <AIFeatures />
        <ExpertInfo />
      </div>

      <Footer />
    </main>
  );
}
