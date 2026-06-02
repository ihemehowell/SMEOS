import type { Membership } from "../generated/client.js";
import type { AuthTokenPayload } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
      membership?: Membership;
    }
  }
}