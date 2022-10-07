import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts";

// Settings file to share between wormscli and your parasite instance.
import { settings as instanceSettings } from "../parasite/settings.ts";
const db_settings = instanceSettings.database.settings;
const client = new Client(db_settings);

export async function basicSelect(
  column: string,
  table: string,
  id: string,
) {
  let res;

  try {
    await client.connect();
    res = await client.queryObject(
      `SELECT ${column} FROM ${table} WHERE id = $1`,
      [id],
    );
    await client.end();
  } catch (e) {
    return { "err": true, "msg": e.toString() };
  }

  if (res.rows.length !== 0) {
    return res.rows[0];
  }

  return {
    "err": true,
    "msg": `row of id '${id}' in table '${table}' doesn't exist`,
  };
}

export async function basicUpdate(
  table: string,
  params = {},
  id: string,
) {
  try {
    await client.connect();
    for (const column in params) {
      await client.queryObject(
        `UPDATE ${table} SET ${column} = $1 WHERE id = $2`,
        [JSON.stringify(params[column]), id],
      );
    }
    await client.end();
  } catch (e) {
    return { "err": true, "msg": e.toString() };
  }
}

export async function basicDelete(
  table: string,
  id: string,
) {
  try {
    await client.connect();
    await client.queryArray(
      `DELETE FROM ${table} WHERE id = $1`,
      [id],
    );

    console.log(`Deleted row of id '${id}' from table '${table}'.`);

    if (table === "users") {
      const defaultTables = ["comments", "torrents", "lists", "actions"];
      for await (const defaultTable of defaultTables) {
        await client.queryObject(
          `DELETE FROM ${defaultTable} WHERE uploader = $1`,
          [id],
        );
      }
    }
    await client.end();
  } catch (e) {
    return { "err": true, "msg": e.toString() };
  }
}

