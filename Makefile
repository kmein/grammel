.PHONY: all
all: plots/.generated

de-extract.jsonl.gz:
	wget https://kaikki.org/dictionary/downloads/de/$@

de-extract.jsonl: de-extract.jsonl.gz
	gunzip -k $<

LIMIT ?= 10000
words.json: de-extract.jsonl filter.jq
	head -n $(LIMIT) de-extract.jsonl | jq -sf filter.jq - > $@

plots/.generated: words.json spectrograms.py
	python3 spectrograms.py
	touch $@

.PHONY: serve
serve:
	python3 -m http.server
