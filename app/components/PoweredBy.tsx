import ChainlinkFunctionsLogo from "../assets/ChainlinkFunctionsLogo";
import ChainlinkAutomationLogo from "../assets/ChainlinkAutomationLogo";
import ChainlinkDataFeedsLogo from "../assets/ChainlinkDataFeedsLogo";

const PoweredBy = () => {
  return (
    <div className="flex flex-col items-center mt-8">
      <div className="mb-4 font-semibold text-md">Powered by</div>
      <div className="grid grid-cols-1 gap-4 pb-6 mt-6 border-b border-gray-200 md:grid-cols-3">
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://docs.chain.link/chainlink-functions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-blue-500 hover:underline"
          >
            <ChainlinkFunctionsLogo />
            <span className="mt-2 text-sm font-medium">
              Chainlink Functions
            </span>
          </a>
        </div>
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://docs.chain.link/chainlink-automation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-blue-500 hover:underline"
          >
            <ChainlinkAutomationLogo />
            <span className="mt-2 text-sm font-medium">
              Chainlink Automation
            </span>
          </a>
        </div>

        <div className="flex flex-col items-center justify-center">
          <a
            href="https://docs.chain.link/data-feeds"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-blue-500 hover:underline"
          >
            <ChainlinkDataFeedsLogo />
            <span className="mt-2 text-sm font-medium">
              Chainlink Data Feeds
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PoweredBy;
