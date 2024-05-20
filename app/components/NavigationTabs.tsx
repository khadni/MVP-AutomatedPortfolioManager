import { useRouter } from "next/router";
import Link from "next/link";

const NavigationTabs = () => {
  const router = useRouter();

  const isActive = (pathname: string) => {
    return router.pathname === pathname
      ? "border-blue-500"
      : "border-transparent";
  };

  return (
    <div className="flex mb-6 space-x-4 border-b">
      <Link
        href="/"
        className={`pb-2 font-semibold border-b-2 hover:border-blue-500 ${isActive(
          "/"
        )}`}
      >
        PORTFOLIO INFO
      </Link>
      <Link
        href="/myinvestment"
        className={`pb-2 font-semibold border-b-2 hover:border-blue-500 ${isActive(
          "/myinvestment"
        )}`}
      >
        MY INVESTMENT
      </Link>
      {/* <Link
        href="/HowItWorks"
        className={`pb-2 font-semibold border-b-2 hover:border-blue-500 ${isActive(
          "/HowItWorks"
        )}`}
      >
        HOW IT WORKS
      </Link> */}
    </div>
  );
};

export default NavigationTabs;
