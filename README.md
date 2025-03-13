# DDNet Skin DB Plus

This is an alternate skin database for DDNet which allows you to filter allowed skins.

Right now not many skins have been manually looked over.

In the future sane will restrict a lot of skins, and some skins may have fixes.

## Usage

`cl_skin_community_download_url dsdp.sollybunny.xyz/skins/`

By default this will have `sane` as the filter, but it can be changed by adding it to the url

`cl_skin_community_download_url dsdp.sollybunny.xyz/skins/<filter>/`

You can then toggle this using

* enable: `cl_download_community_skins 1`
* disable: `cl_download_community_skins 0`

## Filtering

* The filter is made up of parts, either boolean or string
* Boolean logic can be applied
	* not: `!`
	* and: `&`
	* or: `|`
	* xor: `^`
* Brackets are accepted
* You can put `sane` in your filter which will be substituted
	`(!missing_feet&!missing_eyes&!missing_body&!missing_hands&!too_big&!too_small&!not_round&!bad_outlines&!bad_contrast&!bad_style&!big_accessories)`

Example: `sane&(name=*tuzi*|name=santa*)&!(pack=bronies)`

## Boolean Filters

| Name | Description |
| --- | --- |
| `missing_feet` | Feet are missing |
| `missing_eyes` | Eyes are missing |
| `missing_body` | Body is missing |
| `missing_hands` | Hands are missing |
| `too_big` | Body is too big compared to `default` |
| `too_small` | Body is too small to `default` |
| `not_round` | Body is not round |
| `bad_outlines` | Outlines are inconsistent or not present |
| `bad_contrast` | Contrast is bad, eyes and feet are hard to see |
| `bad_style` | Style isn't *tee-ish* |
| `big_accessories` | Accessories (like hats) are too big |
| `uhd` | Skin is UltraHD |

## String Filters

* All strings are not case sensitive; lowercase is preferred.
* Equality can be checked with `<name>=<value>`, where value can contain wildcards (`*`)

| Name | Description |
| `name` | Name of the skin |
| `type` | Either `normal` or `community` |
| `creator` | Who made the skin |
| `license` | The license this skin has |
| `format` | Format of the skin, always `png` |
| `bodypart` | Parts in this skin, always `full` |
| `date` | The date this skin was created |
| `version` | The version of the skin, always `tw-0.6` |
