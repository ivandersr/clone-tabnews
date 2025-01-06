import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebserver();

  async function waitForWebserver() {
    return retry(fetchStatusPage, {
      retries: 50,
      onRetry: (error, attempt) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status page - ${error}`,
        );
      },
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      await response.json();
    }
  }
}

const services = {
  waitForAllServices,
};

export default services;
