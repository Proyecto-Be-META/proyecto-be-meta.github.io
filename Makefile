PYTHON ?= python3

.PHONY: build serve clean

build:
	$(PYTHON) scripts/bib2json.py
	hugo --gc --minify

serve:
	$(PYTHON) scripts/bib2json.py
	hugo server -D

clean:
	rm -rf public resources/_gen
