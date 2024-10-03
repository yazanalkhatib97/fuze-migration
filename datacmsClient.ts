import { SiteClient } from "datocms-client";

// Replace 'your_read-write_api_token' with your actual DatoCMS full-access API token.
export const client = new SiteClient("67d5a313982042726364c7d2f1981d", {
  environment: "maztest",
});
