const pendingRequests = new Map();

const waitForSmsResult = (requestId, timeoutMs) => new Promise((resolve) => {
  const timeout = setTimeout(() => {
    pendingRequests.delete(requestId);
    resolve(null);
  }, timeoutMs);

  pendingRequests.set(requestId, {
    timeout,
    resolve: (payload) => {
      clearTimeout(timeout);
      pendingRequests.delete(requestId);
      resolve(payload);
    }
  });
});

const completeSmsRequest = (requestId, payload) => {
  const pending = pendingRequests.get(requestId);
  if (!pending) {
    return false;
  }

  pending.resolve(payload);
  return true;
};

const cancelSmsRequest = (requestId) => {
  const pending = pendingRequests.get(requestId);
  if (!pending) {
    return false;
  }

  pendingRequests.delete(requestId);
  clearTimeout(pending.timeout);
  return true;
};

module.exports = {
  waitForSmsResult,
  completeSmsRequest,
  cancelSmsRequest
};
