import { HerbalLoader } from "@/app/components/herbal-loader";

export default function Loading() {
  return (
    <section className="section-card loading-screen reveal reveal-delay-1">
      <HerbalLoader />
    </section>
  );
}
