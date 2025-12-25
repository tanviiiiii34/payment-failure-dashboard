const transactions = [
  { id: "TXN001", status: "FAILED", failureReason: "NETWORK_ERROR", retryCount: 2 },
  { id: "TXN002", status: "SUCCESS", failureReason: null, retryCount: 0 },
  { id: "TXN003", status: "FAILED", failureReason: "INVALID_CARD", retryCount: 1 },
  { id: "TXN004", status: "FAILED", failureReason: "TIMEOUT", retryCount: 3 },
];

export default transactions;
