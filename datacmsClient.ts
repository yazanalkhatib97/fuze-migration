import { SiteClient } from "datocms-client";

// Replace 'your_read-write_api_token' with your actual DatoCMS full-access API token.
export const client = new SiteClient(process.env.DATO_CMS_API_KEY, {
  environment: "maztest",
});
