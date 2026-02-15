import { setRequestLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import SectionSkeleton from "@/components/SectionSkeleton";

const ServicesOverview = dynamic(() => import("@/components/ServicesOverview"), {
  ssr: true,
  loading: () => <SectionSkeleton />,
});
const WhyExoterior = dynamic(() => import("@/components/WhyExoterior"), {
  ssr: true,
  loading: () => <SectionSkeleton />,
});
const HowItWorks = dynamic(() => import("@/components/HowItWorks"), {
  ssr: true,
  loading: () => <SectionSkeleton />,
});
const BookingForm = dynamic(() => import("@/components/BookingForm"), {
  ssr: true,
  loading: () => <SectionSkeleton />,
});

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ServicesOverview />
        <WhyExoterior />
        <HowItWorks />
        <BookingForm />
        <Footer />
      </main>
    </>
  );
}
