"""Build the local worker and stage hash-locked official artifacts. No cloud key.
Requires Windows x64 and Python 3.14 (the verified build runtime).
Run from repo root: python scripts/setup-assistant.py
"""
from pathlib import Path
import hashlib
import json
import os
import platform
import shutil
import subprocess
import sys
import urllib.request
import venv
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def main():
    if sys.platform != 'win32' or platform.machine().lower() not in ('amd64', 'x86_64'):
        raise SystemExit('The local assistant currently supports Windows x64.')
    if sys.version_info[:2] != (3, 14):
        raise SystemExit('Use Python 3.14 to match the verified worker build.')
    lock = json.loads((ROOT / 'native/needle/artifacts.lock.json').read_text())
    folder = ROOT / 'build/assistant'
    folder.mkdir(parents=True, exist_ok=True)
    env_dir = folder / 'venv'
    if not (env_dir / 'Scripts/python.exe').exists():
        venv.create(env_dir, with_pip=True)
    interpreter = str(env_dir / 'Scripts/python.exe')
    subprocess.run([interpreter, '-m', 'pip', 'install', '-r', str(ROOT / 'native/needle/build-requirements.txt')], check=True)
    env = {**os.environ, 'NEEDLE_TELEMETRY': '0', 'DO_NOT_TRACK': '1'}
    subprocess.run([interpreter, '-m', 'PyInstaller', '--noconfirm', '--clean', '--onedir',
        '--name', 'los-needle', '--distpath', str(folder / 'dist'), '--workpath', str(folder / 'pyi'),
        '--specpath', str(folder), str(ROOT / 'native/needle/worker.py')], env=env, check=True)
    staging = folder / 'verified'
    staging.mkdir(exist_ok=True)
    for artifact in lock['artifacts']:
        url = artifact['url']
        if not url.startswith('https://huggingface.co/Cactus-Compute/needle3/resolve/'):
            raise SystemExit('Artifact lock contains an unapproved source.')
        file = staging / artifact['name']
        if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest() != artifact['sha256']:
            urllib.request.urlretrieve(url, file)
        if hashlib.sha256(file.read_bytes()).hexdigest() != artifact['sha256']:
            raise SystemExit('Artifact verification failed.')
    destination = ROOT / 'resources/native/win32-x64/needle'
    # Stage to a new sibling first; never merge stale runtime DLLs into a new build.
    pending = ROOT / 'resources/native/win32-x64/needle-pending'
    if pending.exists():
        raise SystemExit('Remove the previous needle-pending folder after reviewing it, then retry.')
    shutil.copytree(folder / 'dist/los-needle', pending)
    for artifact in lock['artifacts']:
        if artifact.get('member'):
            with zipfile.ZipFile(staging / artifact['name']) as archive:
                # Extract a single fixed member, never arbitrary archive paths.
                (pending / 'libneedle.dll').write_bytes(archive.read(artifact['member']))
        else:
            shutil.copy2(staging / artifact['name'], pending / 'needle3.cact')
    shutil.copy2(ROOT / 'native/needle/tools.json', pending / 'tools.json')
    smoke_env = {key:value for key,value in os.environ.items() if key in ('SystemRoot','WINDIR','TEMP','TMP')}
    smoke_env.update(NEEDLE_TELEMETRY='0', DO_NOT_TRACK='1', HF_HUB_OFFLINE='1')
    smoke = subprocess.run([str(pending / 'los-needle.exe')], input=b'{"text":"open courses"}',
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30, env=smoke_env, creationflags=subprocess.CREATE_NO_WINDOW)
    result = json.loads(smoke.stdout) if smoke.returncode == 0 else {}
    if result.get('kind') != 'proposal' or result.get('action') != {'name':'open_view','arguments':{'view':'courses'}}:
        raise SystemExit('Native smoke test failed; existing installed artifacts were preserved.')
    previous = folder / 'previous-native'
    if previous.exists():
        raise SystemExit('Review/remove build/assistant/previous-native before replacing local artifacts again.')
    if destination.exists():
        destination.rename(previous)
    pending.rename(destination)
    shutil.copytree(ROOT / 'native/licenses', destination.parent / 'licenses', dirs_exist_ok=True)
    print('Local commands installed. Run npm run build and restart Synapse.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
