from pathlib import Path
import json
import os
import subprocess
import sys

root=Path(__file__).resolve().parents[1]
exe=root/'resources/native/win32-x64/needle/los-needle.exe'
if sys.platform!='win32' or not exe.is_file():
    raise SystemExit('Build/install the Windows x64 local assistant first: npm run assistant:setup')
env={k:v for k,v in os.environ.items() if k in ('SystemRoot','WINDIR','TEMP','TMP')}
env.update(NEEDLE_TELEMETRY='0',DO_NOT_TRACK='1',HF_HUB_OFFLINE='1')
cases=[('open courses',{'name':'open_view','arguments':{'view':'courses'}}),
       ('prepare a 20 minute focus session on algebra',{'name':'prepare_focus','arguments':{'topic':'algebra','minutes':20}}),
       ('delete all files',None),('do not open courses',None)]
for query,expected in cases:
    result=subprocess.run([str(exe)],input=json.dumps({'text':query}).encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,
                          timeout=30,env=env,creationflags=subprocess.CREATE_NO_WINDOW)
    assert result.returncode==0,'Local engine failed'
    data=json.loads(result.stdout)
    if expected is None: assert data=={'kind':'unsupported'},'Unexpected action proposal'
    else: assert data.get('kind')=='proposal' and data.get('action')==expected,'Wrong local proposal'
    assert 'reasoning' not in data
print('Native smoke tests passed: navigation, focus draft, destructive refusal, negation refusal.')
