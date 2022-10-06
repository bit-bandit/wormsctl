#!/usr/bin/env -S deno run --allow-env --allow-net

// File to share between wormscli and your parasite instance.
// We recommend you do this locally.
import instances from "../parasite/federation.json" assert { type: "json" };
import { roles } from "../parasite/roles.ts";

import {
  basicDelete,
  basicSelect,
  basicUpdate,
  getTables,
} from "./database_utils.ts";

const usage = () =>
  console.log(
    "Usage:\n",
    './wormsctl.ts set user <id> role "Admin": Set a user\'s role to Admin.\n',
    "./wormsctl.ts get torrent <id>: Returns JSON of torrent.\n",
    "./wormsctl.ts rm list <id>: Remove a list.\n",
    "If no commands are specified, an interactive shell will be opened.",
  );

async function exec(args: string[]) {
  let col = args[3] ?? "json";
  // Fallback for default user table
  if (args[1] === "user" && args[3] === undefined) {
    col = "info";
  }

  let table = args[1];
  const db_tables = await getTables();

  if (db_tables[`${args[1]}s`]) {
    table += "s";
  } else {
    console.error("No matching table found");
    return;
  }

  if (args[3] !== undefined && db_tables[table].includes(`${col}s`)) {
    col += "s";
  } else if (db_tables[table].includes(col)) {
    // Do nothing
  } else {
    console.error("No matching column found");
    return;
  }

  switch (args[0]) {
    case "get": {
      const res = await basicSelect(col, table, args[2]);
      console.log(res);
      break;
    }

    case "set": {
      if (args.includes("user") && args.includes("role")) {
        await basicUpdate(table, {
          roles: roles[args[4]],
        }, args[2]);
      }
      break;
    }

    case "delete":
    case "rm": {
      if (!args[2]) {
        return console.error("ID not specified");
      }
      await basicDelete(table, args[2]);
      break;
    }
    default: {
      usage();
    }
  }
}

if (!Deno.args.length) {
  console.log("wormsctl shell");
  console.log("Send an empty statement to exit.");
  console.log("Type 'help' for a list of commands.");
  while (true) {
    let commands = prompt(">");

    if (!commands || !commands.length) {
      break;
    }

    commands = commands.split(" ");
    await exec(commands);
  }
} else {
  if (Deno.args.includes("help")) {
    usage();
  }
  await exec(Deno.args);
}
