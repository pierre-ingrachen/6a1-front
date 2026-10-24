import { InjectionToken, isDevMode } from "@angular/core"

export const DEV_MODE = new InjectionToken<boolean>("DEV_MODE", { providedIn: "root", factory: () => isDevMode() })
