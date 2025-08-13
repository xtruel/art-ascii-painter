import AsciiArtMaker from "@/components/AsciiArtMaker";
import AnimatedAsciiBackground from "@/components/AnimatedAsciiBackground";
import SidebarJavaGlobe from "@/components/MatrixGlobeBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedAsciiBackground />
      <SidebarJavaGlobe />
      <div className="relative z-20">
        <AsciiArtMaker />
      </div>
    </div>
  );
};

export default Index;
