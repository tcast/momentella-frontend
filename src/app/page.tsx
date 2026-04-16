import { EditorialIntro } from "@/components/EditorialIntro";
import { Hero } from "@/components/Hero";
import { InstagramCta } from "@/components/InstagramCta";
import { JourneyTiles } from "@/components/JourneyTiles";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Testimonial } from "@/components/Testimonial";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <EditorialIntro />
        <JourneyTiles />
        <ProcessSteps />
        <Testimonial />
        <InstagramCta />
      </main>
      <SiteFooter />
    </>
  );
}
