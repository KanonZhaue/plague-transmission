import os,re

def n_rows(path):
    lines=[]
    with open(path,'r',encoding='utf8') as f:
        lines= f.readlines()
    lines=[line for line in lines if len(re.sub(r'[\s]','',line))>0]
    return len(lines)

def file_tree(root,bans):
    res=0
    for r in os.walk(root):
        for name in r[2]:
            path = '/'.join([i for i in (r[0]+'/'+name).split('/') if i != ''])
            if path.split('.')[-1] not in bans:
                res+=n_rows(path=path)
    return res
bans=['png']
print(file_tree('./src',bans))