import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";

// File to share between wormscli and your parasite instance.
// We recommend you do this locally.
import { settings as instanceSettings } from "../parasite/settings.ts";

const db_settings = instanceSettings.database.settings;
const client = new Client(db_settings);

export async function basicSelect(
  row: string,
  table: string,
  name: string,
) {
  await client.connect();
  const res = await client.queryArray(
    `SELECT ${row} FROM ${table} WHERE id = $1`,
    [name],
  );
  await client.end();

  if (res.rows.length !== 0) {
    return res.rows[0];
  }

  return { "err": true, "msg": msg };
}

export async function basicUpdate(
  category: string,
  params = {},
  id: string,
) {
  await client.connect();

  for (const prop in params) {
    await client.queryArray(
      `UPDATE ${category} SET ${prop} = $1 WHERE id = $2`,
      [JSON.stringify(params[prop]), id],
    );
  }

  await client.end();
}

export async function basicDelete(
  table: string,
  name: string,
) {
  await client.connect();
  const res = await client.queryArray(
    `DELETE FROM ${table} WHERE id = $1`,
    [name],
  );
  await client.end();
}
