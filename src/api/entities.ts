/**
 * Shapes for the resources managed in the panel. The OpenAPI spec in
 * `types.ts` documents the request bodies but leaves list/detail responses
 * untyped, so these reflect what the screens consume.
 */
export type Campus = {
  id: string;
  name: string;
};

/** Envelope the paginated list endpoints wrap their rows in. */
export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Block = {
  id: string;
  name: string;
  campusId: string;
};

export type Room = {
  id: string;
  name: string;
  blockId: string;
};

export type AcMode = "HEAT" | "DRY" | "COOL" | "FAN";
export type AcFan = "AUTO" | "LOW" | "MEDIUM" | "HIGH";

export type ControllerState = {
  power: boolean;
  mode: AcMode;
  temp: number;
  fan: AcFan;
  swingVertical: boolean;
  swingHorizontal: boolean;
  turbo: boolean;
};

export type Controller = ControllerState & {
  id: string;
  slug: string;
  name: string;
  roomId: string;
};
