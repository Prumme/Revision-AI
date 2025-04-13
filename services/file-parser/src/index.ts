import { cliEntrypoint } from "./infrastructure/cli/cliEntrypoint";
import { mqConsumer } from "./infrastructure/broker/mqConsumer";

const mode = process.env.MODE || "cli"

if(mode === "cli"){
  cliEntrypoint().then()
}else if(mode === "mq"){
  mqConsumer().then()
}
