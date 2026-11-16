"""Import a vocab json into Anki deck AI-German-Words via AnkiConnect.
usage: python3 -I scripts/anki.py <vocab.json> <audio_dir> [extra tags...]
audio_dir must contain wNN.mp3 / sNN.mp3 (1-based, same order as json)."""
import sys,json,base64,os,subprocess,tempfile,urllib.request
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from back_text import back_text
DECK='AI-German-Words'; MODEL='AI-German'
def ac(a,**p):
    r=json.load(urllib.request.urlopen(urllib.request.Request('http://localhost:8765',json.dumps({"action":a,"version":6,"params":p}).encode())))
    if r['error']: raise SystemExit(f"{a}: {r['error']}")
    return r['result']
FIELDS=['Word','Article','Plural','Forms','Chinese','SentenceDE','SentenceZH','AudioWord','AudioBack','AudioSentence','Lesson']
CSS='''.card{font-family:-apple-system,"PingFang SC",sans-serif;font-size:22px;text-align:center;color:#1f2328;background:#fbfaf7}
.w{font-size:40px;font-weight:650;margin:18px 0 6px}.der{color:#c8323c}.die{color:#2563c9}.das{color:#b8860b}
.meta{color:#6b7280;font-size:18px}.zh{font-size:28px;margin:14px 0}.ex{font-size:20px;margin-top:16px;line-height:1.5}.exzh{color:#6b7280;font-size:17px}
.nightMode .card,.night_mode .card{color:#e8e6e1;background:#1c1d1f}.nightMode .der{color:#ff8a8f}.nightMode .die{color:#7fb0ff}.nightMode .das{color:#f2c94c}'''
FRONT='<div class="w">{{Word}}</div>{{AudioWord}}'
BACK='<div class="w {{Article}}">{{#Article}}{{Article}} {{/Article}}{{Word}}</div>{{AudioBack}}'+'<div class="meta">{{Plural}} {{Forms}}</div><hr id=answer><div class="zh">{{Chinese}}</div><div class="ex">{{SentenceDE}}</div><div class="exzh">{{SentenceZH}}</div>{{AudioSentence}}'
def restyle():
    ac('updateModelStyling',model={'name':MODEL,'css':CSS}); print('restyled')
def retemplate():
    ac('updateModelTemplates',model={'name':MODEL,'templates':{"DE→ZH":{"Front":FRONT,"Back":BACK}}}); print('templates updated')
def ensure():
    if MODEL not in ac('modelNames'):
        ac('createModel',modelName=MODEL,inOrderFields=FIELDS,css=CSS,cardTemplates=[{"Name":"DE→ZH","Front":FRONT,"Back":BACK}])
    ac('createDeck',deck=DECK)
def seen(word):
    w=word.split()[0]
    q=(f'("deck:Goethe Institute A2 Wordlist" "de_word:{w}") OR ("deck:Goethe Institute A2 Wordlist" "de_word:sich {w}")'
       f' OR ("deck:新编大学德语 B1" "Front:re:(^|[ /]){w}( |$)") OR ("deck:新编大学德语 B2" "Front:re:(^|[ /]){w}( |$)")')
    return bool(ac('findNotes',query=f'({q}) -is:new'))
def retag():
    for n in ac('notesInfo',notes=ac('findNotes',query=f'deck:{DECK}')):
        w=n['fields']['Word']['value']; has='seen-before' in n['tags']; s_=seen(w)
        if has and not s_: ac('removeTags',notes=[n['noteId']],tags='seen-before')
        if s_ and not has: ac('addTags',notes=[n['noteId']],tags='seen-before')
    print('seen-before now:',len(ac('findNotes',query=f'deck:{DECK} tag:seen-before')))
def main():
    if sys.argv[1]=='--retag': return retag()
    if sys.argv[1]=='--restyle': return restyle()
    if sys.argv[1]=='--retemplate': return retemplate()
    vj,ad,*tags=sys.argv[1:]; v=json.load(open(vj)); day=os.path.basename(vj).split('.')[0]
    ensure(); added=skipped=0; seenl=[]
    for i,x in enumerate(v,1):
        if ac('findNotes',query=f'deck:{DECK} "Word:{x["word"]}"'): skipped+=1; continue
        aw,as_=f'gw_{day}_w{i:02d}.mp3',f'gw_{day}_s{i:02d}.mp3'
        wp=f'{tempfile.mkdtemp()}/w.mp3'  # word audio is the bare word, no article
        subprocess.run(['uvx','edge-tts','--voice','de-DE-KatjaNeural','--text',x['word'],'--write-media',wp],check=True,capture_output=True)
        ab=f'gw_{day}_b{i:02d}.mp3'; bp=f'{os.path.dirname(wp)}/b.mp3'  # back audio: article+word+plural / verb forms
        subprocess.run(['uvx','edge-tts','--voice','de-DE-KatjaNeural','--text',back_text(dict(Word=x['word'],Article=x['article'],Plural=x['plural'],Forms=x['forms'])),'--write-media',bp],check=True,capture_output=True)
        for fn,src in((aw,wp),(ab,bp),(as_,f'{ad}/s{i:02d}.mp3')):
            ac('storeMediaFile',filename=fn,data=base64.b64encode(open(src,'rb').read()).decode())
        t=['ai-german',f'd{day}']+tags
        if seen(x['word']): t.append('seen-before'); seenl.append(x['word'])
        f=dict(Word=x['word'],Article=x['article'],Plural=x['plural'],Forms=x['forms'],Chinese=x['zh'],SentenceDE=x['sentence_de'],SentenceZH=x['sentence_zh'],AudioWord=f'[sound:{aw}]',AudioBack=f'[sound:{ab}]',AudioSentence=f'[sound:{as_}]',Lesson=str(x.get('lesson','')))
        ac('addNote',note=dict(deckName=DECK,modelName=MODEL,fields=f,tags=t,options={"allowDuplicate":True})); added+=1
    print(f'added {added}, skipped {skipped}, seen-before {len(seenl)}: {", ".join(seenl)}')
if __name__=='__main__': main()
