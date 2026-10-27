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

export type Controller = {
  id: string;
  deviceId: string;
  roomId: string;
  nickname?: string | null;
  acManufacturer?: string | null;
  irProtocol?: string | null;
};
