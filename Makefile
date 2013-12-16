
JS = $(wildcard lib/*/*.js)
JSON = $(wildcard lib/*/*.json)
HTML = $(wildcard lib/*/*.html)
TPL = $(HTML:.html=.js)

build: components $(JS) $(JSON) $(TPL)
	@component build --dev --out=public/build/

components: component.json $(JSON)
	@component install --dev

%.js: %.html
	@component convert $<
	