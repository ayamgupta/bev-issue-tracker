-- Word-frequency view for the free-text "Anything else?" notes field, used to
-- render a public word cloud without ever shipping individual raw notes to
-- the browser (notes stay in `reports`, already publicly selectable, but the
-- frontend has never displayed them directly). Numeric tokens (e.g. phone
-- numbers typed by mistake) are stripped by the [^a-z] filter below, and a
-- `having count(*) >= 2` floor means a word tied to only one report never
-- appears — a lightweight guard against a rare word acting as an identifier.
create or replace view public.analytics_notes_word_frequency as
with stopwords(word) as (
  values
    ('the'), ('and'), ('for'), ('are'), ('but'), ('not'), ('you'), ('all'), ('can'),
    ('has'), ('have'), ('had'), ('was'), ('were'), ('been'), ('with'), ('this'),
    ('that'), ('from'), ('they'), ('their'), ('them'), ('its'), ('very'),
    ('also'), ('just'), ('some'), ('than'), ('then'), ('when'), ('what'), ('which'),
    ('who'), ('whom'), ('while'), ('after'), ('before'), ('about'), ('into'),
    ('over'), ('under'), ('again'), ('once'), ('here'), ('there'), ('these'),
    ('those'), ('being'), ('does'), ('doing'), ('did'), ('would'),
    ('could'), ('should'), ('will'), ('shall'), ('may'), ('might'), ('must'),
    ('one'), ('two'), ('three'), ('get'), ('got'), ('getting'), ('like'), ('really'),
    ('even'), ('still'), ('much'), ('many'), ('more'), ('most'), ('other'),
    ('such'), ('only'), ('same'), ('own'), ('out'), ('off'), ('now'), ('any'),
    ('our'), ('your'), ('his'), ('her'), ('him'), ('she'), ('im'), ('ive'),
    ('dont'), ('didnt'), ('doesnt'), ('cant'), ('wasnt'), ('werent'), ('isnt'),
    ('a'), ('an'), ('to'), ('of'), ('in'), ('on'), ('is'), ('it'), ('as'), ('at'),
    ('by'), ('or'), ('be'), ('if'), ('so'), ('we'), ('my'), ('me'), ('no')
)
select word, count(*) as occurrences
from (
  select lower(regexp_replace(w, '[^a-zA-Z]', '', 'g')) as word
  from public.reports, regexp_split_to_table(coalesce(notes, ''), '\s+') as w
  where status in ('verified', 'pending')
) words
where length(word) >= 4
  and word not in (select word from stopwords)
group by word
having count(*) >= 2
order by occurrences desc
limit 60;

grant select on public.analytics_notes_word_frequency to anon, authenticated;
