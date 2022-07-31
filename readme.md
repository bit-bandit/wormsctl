# `wormsctl` - Command line interface for Parasite instances

## Installation
```
deno install --allow-net --allow-read --allow-write --allow-env https://raw.githubusercontent.com/bit-bandit/wormsctl/main/wormsctl.ts
```

## Examples:
```sh
# Set role of user 'Bob' to 'Admin'
wormsctl set --user='bob' --role='Admin'

# Delete torrent
wormsctl remove --torrent='2e1a06ddf3'

# Delete list
wormsctl remove --list='78a3beb44f'

# Show user role
wormsctl show --role --user='bob'
```
More examples are yet to come.

## License
0BSD
