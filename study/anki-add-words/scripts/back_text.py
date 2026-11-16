"""Build the text read on the card back: 'das Kind, Kinder' / 'halten, er hält, hat gehalten'."""
import re
SUF={'','n','e','en','er','s','nen'}
def umlaut(w):
    """Umlaut the last a/o/u (au -> äu)."""
    M={'a':'ä','o':'ö','u':'ü','A':'Ä','O':'Ö','U':'Ü'}
    i=max((j for j,c in enumerate(w) if c in M),default=-1)
    if i<0: return None
    if w[i] in 'uU' and i>0 and w[i-1] in 'aA': i-=1   # au -> äu
    return w[:i]+M[w[i]]+w[i+1:]
SPECIAL={('Supermarkt','-märkte'):'Supermärkte',('Kaufmann','-leute'):'Kaufleute'}
def plural(word,pl):
    pl=pl.strip().split()[0] if pl.strip() else ''
    if not pl: return ''
    if (word,pl) in SPECIAL: return SPECIAL[(word,pl)]
    if pl[0].isupper(): return pl                      # full plural form given
    rest=pl.replace('¨','').lstrip('-')
    if rest not in SUF: return None
    stem=umlaut(word) if '¨' in pl else word
    return None if stem is None else stem+rest
def back_text(x):
    w,a,p,f=x['Word'].strip(),x['Article'].strip(),x['Plural'].strip(),x['Forms'].strip()
    if a:
        if p in('Pl.','(Pl.)'): return f'die {w}'
        pp=plural(w,p) if p else ''
        return f'{a} {w}, {pp}' if pp else f'{a} {w}'
    return f'{w}, {f}' if f else w
