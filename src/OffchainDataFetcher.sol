// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

/**
 * @title Functions contract used for Automation.
 * @notice This contract is a demonstration of using Functions and Automation.
 * @notice You may need to add a Forwarder for additional security.
 * @notice NOT FOR PRODUCTION USE
 */
contract OffchainDataFetcher is FunctionsClient, ConfirmedOwner {
    bytes internal request;
    address public upkeepContract;
    uint64 internal subscriptionId;
    uint32 internal gasLimit;
    bytes32 internal donID;
    bytes32 public s_lastRequestId;
    uint256[] public s_lastResponse;
    bytes public s_lastError;

    error OffchainDataFetcher__NotAllowedCaller(address caller, address owner, address upkeepContract);
    error OffchainDataFetcher__UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);
    event DecodedResponse(bytes32 indexed requestId, uint256[] suggestedAlloc);

    constructor(address router) FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Reverts if called by anyone other than the contract owner or automation registry.
     */
    modifier onlyAllowed() {
        if (msg.sender != owner() && msg.sender != upkeepContract) {
            revert OffchainDataFetcher__NotAllowedCaller(msg.sender, owner(), upkeepContract);
        }
        _;
    }

    function setAutomationCronContract(address _upkeepContract) external onlyOwner {
        upkeepContract = _upkeepContract;
    }

    /**
     * @notice Updates the parameters for outgoing requests.
     * @dev This function allows the owner to set new parameters for the CBOR-encoded request that is sent off-chain.
     * This includes updating the job ID, subscription ID, gas limit, and the actual request data.
     * This method is only callable by the contract owner.
     * @param _request The new encoded CBOR request data, which is encoded off-chain.
     * @param _subscriptionId The new subscription ID to be used for billing.
     * @param _gasLimit The maximum amount of gas that should be used for the callback transaction that processes the response.
     * @param _donID The new job ID to be set.
     */
    function updateRequest(bytes memory _request, uint64 _subscriptionId, uint32 _gasLimit, bytes32 _donID)
        external
        onlyOwner
    {
        request = _request;
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        donID = _donID;
    }

    /**
     * @notice Send a pre-encoded CBOR request
     * @return requestId The ID of the sent request
     */
    function sendRequestCBOR() external onlyAllowed returns (bytes32 requestId) {
        s_lastRequestId = _sendRequest(request, subscriptionId, gasLimit, donID);
        return s_lastRequestId;
    }

    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (s_lastRequestId != requestId) {
            revert OffchainDataFetcher__UnexpectedRequestID(requestId);
        }
        s_lastError = err;

        if (response.length > 0) {
            (uint256 btcSentimentScore, uint256 ethSentimentScore, uint256 gvzValue) =
                abi.decode(response, (uint256, uint256, uint256));

            s_lastResponse = [btcSentimentScore, ethSentimentScore, gvzValue];

            emit DecodedResponse(requestId, s_lastResponse);
        }

        emit Response(requestId, response, err);
    }

    /**
     * @notice Retrieves the full array of the last response received.
     * @dev This function returns the complete array of latest suggested allocations
     * which is updated whenever a new response is successfully processed.
     * @return A uint256 array representing the latest allocations for assets.
     */
    function getLastResponse() public view returns (uint256[] memory) {
        return s_lastResponse;
    }
}
