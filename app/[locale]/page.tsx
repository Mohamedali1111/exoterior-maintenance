import { setRequestLocale, getTranslations } from "next-intl/server";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ServicesOverview from "@/components/ServicesOverview";
import WhyExoterior from "@/components/WhyExoterior";
import HowItWorks from "@/components/HowItWorks";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

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
