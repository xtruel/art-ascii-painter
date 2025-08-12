import AsciiArtMaker from "@/components/AsciiArtMaker";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="container py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ASCII Art Maker</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Turn text into beautiful ASCII art. Choose ramps, tweak aspect and contrast, copy or download your creation.
        </p>
      </header>
      <main className="container pb-16">
        <AsciiArtMaker />
      </main>
    </div>
  );
};

export default Index;
