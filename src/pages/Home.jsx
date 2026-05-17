import HeroSection from "../components/home/HeroSection";
import FeatureCards from "../components/home/FeatureCards";
import QuickStartSection from "../components/home/QuickStartSection";
import ContinueLearning from "../components/home/ContinueLearning";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ContinueLearning />
      <FeatureCards />
      <QuickStartSection />
    </div>
  );
}