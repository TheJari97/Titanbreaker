# Update workflow

1. Place a local copy of the Catzee repository in `sources/Titanbreaker-master`
2. Run `tools/update_data.bat`

What it does:
- refreshes data from the Catzee text sources
- preserves the blacklist rules from `catzee_blacklist.json`
- syncs local visuals from the Catzee repo when available:
  - item icons
  - path tree / mastery icons
  - hero icons

If the local repo is not present, the data still updates from remote text files, but image syncing will be skipped.
