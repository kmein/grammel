def split_phonemes:
  [scan(
    "aː|eː|iː|oː|uː|yː|øː|p͡f|t͡ʃ|t͡s|ɛː|aʊ̯|ɔɪ̯|aɪ̯|ɔʏ̯|ɛɪ̯|."
  )]
;

def normalize:
  gsub("[\\[\\]]"; "")
  | gsub("[ˈˌ.]"; "")
  | gsub("i̯";"j")
  | gsub("ɑ";"a")
  | gsub("n̩";"ən")
  | gsub("ɐ̯"; "ʁ")
  | gsub("m̩"; "əm")
  | gsub("l̩"; "əl")
  | gsub("ɔʏ̯"; "ɔɪ̯")
;

map(
  .sounds
  | select(type == "array")
  | {
      ipa: (map(select(has("ipa")) | .ipa)[0] | normalize | split_phonemes),
      ogg_url: (map(select(has("ogg_url")) | .ogg_url)[0])
    }
  | select(.ipa != null and .ogg_url != null)
  | select(.ipa | length == 5)
  | select(.ogg_url | test("De-"))
)
