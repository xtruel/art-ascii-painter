import AsciiArtMaker from "@/components/AsciiArtMaker";
import AnimatedAsciiBackground from "@/components/AnimatedAsciiBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedAsciiBackground />
      <div className="relative z-10">
        <AsciiArtMaker />
      </div>
    </div>
  );
};

export default Index;
