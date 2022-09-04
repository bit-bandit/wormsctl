# `wormsctl` - Command line interface for Parasite instances

## Installation
```sh
# In the parent directory of your Parasite installation
git clone https://github.com/bit-bandit/wormsctl
cd wormsctl
```

We are aware this is counterintuitive.

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

## License

0BSD
