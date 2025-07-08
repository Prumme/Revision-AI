import express, { Request, Response } from "express";
import z, { ZodType } from "zod";
import { quizEditRequest } from "./requests/quizEditRequest";

const app = express();
function parseRequest<T extends ZodType>(
  req: Request,
  schema: T,
): z.infer<T> | false {
  const payload = {
    ...req.body,
    ...req.query,
  };

  const response = schema.safeParse(payload);
  if (response.success) {
    return response.data;
  }
  return false;
}

function abort(res: Response, code: number, message?: string): void {
  res.status(code);
  if (message) res.json({ message, code });
  else
    res.json({
      message: res.statusMessage,
      code,
    });
  return;
}

app.use(express.json());

app.post("/quiz/edit", (req: Request, res: Response) => {
  const payload = parseRequest(req, quizEditRequest);
  if (!payload) return abort(res, 422);
  res.json("oui");
});

app.listen(8080);
