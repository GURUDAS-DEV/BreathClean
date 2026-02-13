import { Router } from "express";

import {
  googleCallback,
  googleLink,
  googleLogout,
} from "../controllers/oauth.controllers.js";

const routes = Router();

routes.get("/google/link", googleLink);
routes.get("/google/callback", googleCallback);
routes.get("/google/logout", googleLogout);

export default routes;
