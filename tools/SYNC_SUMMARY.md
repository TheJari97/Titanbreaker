# Sync summary

## What was updated
- Items: 932 -> 961
- Items updated from Catzee repo overlap: 413
- New repo-only items added: 29
- Current-site items preserved because they are not in custom KV: 337

- Talents: 198 -> 198
- Talents updated from panorama localization: 73

- Heroes generated in roster: 49
- Hero detail entries generated: 49
- Ready heroes: 39
- Coming heroes: 10

## Blacklist
- item_bag_of_gold
- item_treasure_chest

## Important caveats
- I updated items, talents, and heroes using Catzee's public KV/localization sources and preserved your current site-only items when they were absent from the custom KV.
- I did **not** attempt to rebuild runewords from scratch.
- I did **not** fully regenerate crafts from repository logic; I refreshed craft images/rarity using the updated item dataset.
- Repo-only items without a matching local image use `assets/images/items/items_recipe.png`.
