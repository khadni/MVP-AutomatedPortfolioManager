import { useRouter } from "next/router";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import GitHubLogo from "../assets/GitHubLogo";

const NavigationTabs = () => {
  const router = useRouter();

  const isActive = (pathname: string) => {
    return router.pathname === pathname
      ? "border-blue-500"
      : "border-transparent";
  };

  return (
    <>
      <div className="flex items-center justify-between mb-24">
        <a
          href="https://github.com/smartcontractkit/quickstarts-automated-portfolio-manager"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubLogo />
        </a>
        <div>
          <ConnectButton />
        </div>
      </div>
      <div className="flex mb-6 space-x-4 border-b">
        <Link
          href="/"
          className={`pb-2 font-semibold border-b-2 hover:border-blue-500 ${isActive(
            "/"
          )}`}
        >
          AUTOMATED PORTFOLIO INFO
        </Link>
        <Link
          href="/MyInvestment"
          className={`pb-2 font-semibold border-b-2 hover:border-blue-500 ${isActive(
            "/MyInvestment"
          )}`}
        >
          MY INVESTMENT
        </Link>
      </div>
    </>
  );
};

export default NavigationTabs;
