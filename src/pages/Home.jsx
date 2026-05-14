import HeroSection from "../components/home/HeroSection";
import FeatureCards from "../components/home/FeatureCards";
import QuickStartSection from "../components/home/QuickStartSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeatureCards />
      <QuickStartSection />
    </div>
  );
}