import { Router, type IRouter } from "express";
import healthRouter from "./health";
import establishmentsRouter from "./establishments";
import authRouter from "./auth";
import appRouter from "./app";
import activitiesRouter from "./activities";
import requestsRouter from "./requests";
import notificationsRouter from "./notifications";
import statisticsRouter from "./statistics";
import documentsRouter from "./documents";
import mediaPublicationsRouter from "./media-publications";
import adminUsersRouter from "./admin-users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(appRouter);
router.use(statisticsRouter);
router.use(documentsRouter);
router.use(mediaPublicationsRouter);
router.use(adminUsersRouter);
router.use(activitiesRouter);
router.use(requestsRouter);
router.use(notificationsRouter);
router.use(establishmentsRouter);

export default router;
