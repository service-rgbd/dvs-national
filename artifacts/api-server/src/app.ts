import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { loadAuthSession } from "./middleware/auth";
import { getCorsOrigin } from "./lib/auth-cookies";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ extended: true, limit: '80mb' }));
app.use(loadAuthSession);

app.use("/api", router);
app.use(errorHandler);

export default app;
