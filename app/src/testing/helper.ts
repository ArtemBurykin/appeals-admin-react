/**
 * Waits till msw returns a response.
 */
export const waitTillMswResponses = () => {
  // 50 in order to wait till msw returns a response
  return new Promise((resolve) => setTimeout(resolve, 50));
};
