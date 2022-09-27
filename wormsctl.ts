#!/usr/bin/env -S deno run --allow-env --allow-net

// File to share between wormscli and your parasite instance.
// We recommend you do this locally.
import instances from "../parasite/federation.json" assert { type: "json" };
import { roles } from "../parasite/roles.ts";

import * as dbutils from "./database_utils.ts";

function printCommands() {
  console.log("Commands:");
  console.log("  get table id [column]");
  console.log("  get table.id[.column]:");
  console.log("    Returns data for a row by id in a table.");
  console.log("    If a column is given, returns that column.");
  console.log("  set table id column to value");
  console.log("  set table.id.column to value:");
  console.log("    Sets a column of a row by id in a table, to value.");
  console.log("  delete table id");
  console.log("  delete table.id:");
  console.log("    Deletes a row by id into table.");
  console.log("    This also deletes user data if a user is deleted.");
}

function printUsage() {
  console.log("Usage: wormsctl [command args...]");
  console.log("Open wormsctl without arguments for a shell.");
  console.log("");
  printCommands();
}

// Too lazy to assign an actual interface/type to this
function handleOut(res: unknown) {
  if (!res.err) {
    console.log(res);
  } else {
    console.log(`ERROR: ${res.msg}`);
  }
}

// Required to terminate identifiers
function isToOrEquals(str) {
  return str.toLowerCase() === "to" || str === "=";
}

// Reads a table, row, and column that are optionally seperated by .
function getIdentifier(args) {
  const names = ["table", "id", "column"];
  const identifier = {};

  while (args.length && names.length) {
    const read = args.shift().split(".");

    while (read.length && names.length) {
      const arg = read.shift();

      if (isToOrEquals(arg)) {
        break;
      }

      identifier[names.shift()] = arg;
    }
  }

  // If we didn't read enough (need at least table.column)
  if (names.length > 1) {
    return null;
  }

  return identifier;
}

// The function that actually does things
async function execute(statement) {
  // Replit by both . and ' '
  const args = statement.split(" ");
  const command = args.shift();

  switch (command) {
    case "get": {
      const info = getIdentifier(args);

      if (!info) {
        return console.log(
          `ERROR: identifier must have table, id, and optionally column.`,
        );
      }

      if (args.length) {
        return console.log(
          `ERROR: too many arguments for command '${command}'.`,
        );
      }

      const res = await dbutils.basicSelect(
        info.column ?? "*",
        info.table,
        info.id,
      );

      handleOut(res);

      break;
    }
    case "set": {
      const info = getIdentifier(args);

      if (!info || !("column" in info)) {
        return console.log(
          `ERROR: identifier must have table, id, and column.`,
        );
      }

      if (!args.length || !isToOrEquals(args.shift())) {
        return console.log(
          `ERROR: '${command}' command requires 'to' or '=' after identifier.`,
        );
      }

      if (!args.length) {
        return console.log(
          `ERROR: '${command}' command requires a value after the 'to' or '='.`,
        );
      }

      const value = args.shift();

      if (args.length) {
        return console.log(
          `ERROR: too many arguments for command '${command}'.`,
        );
      }

      const res = await dbutils.basicUpdate(info.table, {
        [info.column]: value,
      }, info.id);

      break;
    }
    case "remove":
    case "delete": {
      const info = getIdentifier(args);

      if (!info || "column" in info) {
        return console.log(`ERROR: identifier must only have table and id.`);
      }

      if (args.length) {
        return console.log(
          `ERROR: too many arguments for command '${command}'.`,
        );
      }

      const res = await dbutils.basicDelete(info.table, info.id);

      break;
    }
    case "shell": {
      if (args.length) {
        return handleOut(await dbutils.basicExec(args.join(" ")));
      } else {
        await dbutils.basicShell();
      }

      break;
    }
    case "help": {
      printCommands();
      break;
    }
    default: {
      console.log(`ERROR: Invalid command '${command}'.`);
      console.log();

      printCommands();
    }
  }
}

// the stanky part of the code that handles arguments
// and also the part of the code that does the main repl
if (Deno.args.length) {
  if (
    Deno.args.includes("-h") ||
    Deno.args.includes("-help") ||
    Deno.args.includes("--help")
  ) {
    printUsage();
  } else {
    await execute(Deno.args.join(" "));
  }
} else {
  console.log("wormsctl shell");
  console.log("Send an empty statement to exit.");
  console.log("Type 'help' for a list of commands.");
  console.log("");

  while (true) {
    const commands = prompt(">");

    if (!commands || !commands.length) {
      break;
    }

    await execute(commands);
  }
}
