import React from "react";

const Disclaimer = () => {
  return (
    <div className="p-4 mb-4 border rounded-lg bg-yellow-50">
      <div className="mb-2 text-sm font-semibold text-gray-700">
        ⚠️ Disclaimer
      </div>
      <p className="text-xs text-gray-600">
        This tutorial represents an educational example to use a Chainlink
        system, product, or service and is provided to demonstrate how to
        interact with Chainlink’s systems, products, and services to integrate
        them into your own. This template is provided “AS IS” and “AS AVAILABLE”
        without warranties of any kind, it has not been audited, and it may be
        missing key checks or error handling to make the usage of the system,
        product or service more clear. Do not use the code in this example in a
        production environment without completing your own audits and
        application of best practices. Neither Chainlink Labs, the Chainlink
        Foundation, nor Chainlink node operators are responsible for unintended
        outputs that are generated due to errors in code.
      </p>
    </div>
  );
};

export default Disclaimer;
