import AsciiArtMaker from "@/components/AsciiArtMaker";
import AnimatedAsciiBackground from "@/components/AnimatedAsciiBackground";
import SimpleJavaBackground from "@/components/MatrixGlobeBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedAsciiBackground />
      <SimpleJavaBackground />
      <div className="relative z-20">
        <AsciiArtMaker />
      </div>
    </div>
  );
};

export default Index;
