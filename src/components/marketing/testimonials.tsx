import { Testimonials as HomeTestimonials } from "@/components/home/testimonials";

/** Marketing landing — same verified quotes, framed for public storytelling. */
export function Testimonials() {
  return (
    <div id="testimonials" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
      <HomeTestimonials />
    </div>
  );
}
