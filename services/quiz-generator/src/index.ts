import { cliEntrypoint } from "./infrastructure/cli/cliEntrypoint";
import { mqConsumer } from "./infrastructure/broker/mqConsumer";

const mode = process.env.MODE || "cli"

const run = async () => {
  try {
    if (mode === "cli") {
      await cliEntrypoint();
    } else if (mode === "mq") {
      await mqConsumer();
    }
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

run();