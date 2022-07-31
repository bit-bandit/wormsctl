// Flag parser that doesn't make me want to cut my fingers off.
import { parse } from "https://deno.land/std/flags/mod.ts";

// File to share between wormscli and your parasite instance.
// We recommend you do this locally.
import instances from "../parasite/federation.json" assert { type: "json" };
import { roles } from "../parasite/roles.ts";

import { basicDelete, basicSelect, basicUpdate } from "./database_utils.ts";

const flags = parse(Deno.args);

flags._ = flags._[0];

if (flags.showArgs) {
  console.log(flags);
}
switch (flags._) {
  case "remove": {
    if (flags.torrent) {
      basicDelete("torrents", flags.torrent);
    }
    if (flags.list) {
      basicDelete("lists", flags.list);
    }
    if (flags.comment) {
      basicDelete("comments", flags.comment);
    }
    if (flags.user) {
      // This will have consequences. You have been warned.
      basicDelete("users", flags.user);
    }
    break;
  }
  case "set": {
    if (flags.role) {
      if (!flags.user) {
        console.log(`ERROR: 'user' flag must be present!`);
      }
      await basicUpdate("users", {
        "roles": roles[flags.role],
      }, flags.user);
    }
    break;
  }
  case "show": {
    // What else can I put here?
    if (flags.role) {
      if (!flags.user) {
        console.log(`ERROR: 'user' flag must be present!`);
      }
      const res = await basicSelect("roles", "users", flags.user);
      if (!res.err) {
        console.log(res[0]);
      } else {
        console.log(`ERROR: ${res.msg}`);
      }
    }
    break;
  }
  case (undefined):
  case ("help"): {
    console.log("RTFM");
    break;
  }
  default: {
    console.log(`ERROR: '${flags._}' is not a valid argument!`);
  }
}
