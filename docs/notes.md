# GENERAL DEV NOTES I GUESS

## CSS

all css variables are stored at the top of /assets/css/style.scss
these are useful for reuse of things like colours for themes (and at current need to be employed more extensively)

mixins should also be defined in this file (reusable css called with @import, basically css functions)

media queries are made with the following:

	@include mq(DEVICE_TYPE) {CSS HERE}

DEVICE_TYPE is mobile, tablet, desktop, wide
queries should be used when stuff looks weird when resized
this uses min_size so smaller resolutions should be defined before larger ones (large resolutions can fulfil multiple min_size conditions so it relies on inheritance order)
ofc these should also come after the css theyre affecting or the main style will always take priority

