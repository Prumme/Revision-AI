import * as fs from "node:fs";
import { z } from "zod";
import { generateQuizFromFileContentFactory } from "../../app/usecases/GenerateQuizFromFileContentUseCase";
import { ScalewayQuizIAAgent } from "../services/ScalewayQuizIAAgent";

const quizIAAgent = new ScalewayQuizIAAgent();

export const cliEntrypoint = async () => {
  const filePathJSON = process.argv[2];
  if (!filePathJSON) {
    console.error("Please provide a file path as an argument.");
    process.exit(1);
  }

  //check if json file exists
  const filePath = filePathJSON.endsWith(".json")
    ? filePathJSON
    : filePathJSON + ".json";
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist.`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  try {
    const json = JSON.parse(content);
    const schemaFileParse = z.object({
      fileName: z.string(),
      content: z.string().optional(),
      pages: z
        .array(
          z.object({
            number: z.number(),
            content: z.string(),
            images: z.array(
              z.object({
                fileName: z.string(),
                content: z.string(),
              }),
            ),
          }),
        )
        .optional(),
    });

    const fileContent = schemaFileParse.parse(json);
    const useCase = generateQuizFromFileContentFactory(quizIAAgent);

    const result = await useCase({
      filesContents: [fileContent],
      questionsNumbers: 5,
    });
    if (result.success == false) {
      console.error("Error generating quiz:", result.error.message);
      process.exit(1);
    }

    const quiz = result.value;
    console.log(JSON.stringify(quiz, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    process.exit(1);
  }
};
