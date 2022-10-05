#!/usr/bin/env -S deno run --allow-env --allow-net

// File to share between wormscli and your parasite instance.
// We recommend you do this locally.
import instances from "../parasite/federation.json" assert { type: "json" };
import { roles } from "../parasite/roles.ts";

import { basicDelete, basicSelect, basicUpdate } from "./database_utils.ts";

const usage = () =>
  console.log(
    "Usage:\n",
    './wormsctl.ts set user <id> role "Admin": Set a user\'s role to Admin.\n',
    "./wormsctl.ts get torrent <id>: Returns JSON of torrent.\n",
    "./wormsctl.ts rm list <id>: Remove a list.\n",
    "If no commands are specified, an interactive shell will be opened.",
  );

async function exec(args: string[]) {
  // Overused variables
  let col = args[3] ?? "json";
  let table = args[1];

  if (
    args[1] === "torrent" || args[1] === "list" || args[1] === "user" ||
    args[1] === "comments"
  ) {
    table += "s";
  }

  if (args[3] === "role") {
    col += "s";
  }

  // Fallback for user table
  if (args[1] === "user" && args[3] === undefined) {
    col = "info";
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
  if (Deno.args.includes) {
    usage();
  }
  await exec(Deno.args);
}
