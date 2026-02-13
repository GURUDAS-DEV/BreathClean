import { Router } from "express";

import {
  googleCallback,
  googleLink,
} from "../controllers/oauth.controllers.js";

const routes = Router();

routes.get("/google/link", googleLink);
routes.get("/google/callback", googleCallback);

export default routes;
