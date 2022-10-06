# `wormsctl` - Command line interface for Parasite instances

## Installation

```sh
# In the parent directory of your Parasite installation
git clone https://github.com/bit-bandit/wormsctl
cd wormsctl
```

We are aware this is counterintuitive.

## Examples:

```
# Get Torrent JSON
./wormsctl.ts get torrent 2e1a06ddf3

# Get list likes
./wormsctl.ts get list 78a3beb44f likes

# Get user role
./wormsctl.ts get user bob role

# Set Bob's role to Admin
./wormsctl.ts set user bob role Admin

# Delete a comment
./wormsctl.ts delete comment 37b567dfa3
```

## License

0BSD
