"""Install a hash-pinned upstream binary and build the trusted Windows launcher.
Build machine: Python 3 and x64 MinGW GCC 15.2.0. Neither is needed by users.
No shell invocation, arbitrary extraction paths, or changes to Needle artifacts.
"""
from pathlib import Path
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import urllib.request
import uuid
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LOCK = json.loads((ROOT / 'native/obscura/artifacts.lock.json').read_text(encoding='utf-8'))

def download(item, cap):
    request = urllib.request.Request(item['url'], headers={'User-Agent': 'LOS-Reader-Setup/1.0'})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read(cap + 1)
    if len(data) > cap or hashlib.sha256(data).hexdigest() != item['sha256']:
        raise RuntimeError('Upstream artifact checksum/size mismatch')
    return data

def run(args, **kwargs):
    return subprocess.run([str(arg) for arg in args], check=True, timeout=60,
                          capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW, **kwargs)

def main():
    if sys.platform != 'win32' or os.environ.get('PROCESSOR_ARCHITECTURE', '').upper() != 'AMD64':
        raise RuntimeError('The public reader supports Windows x64 only')
    gcc = shutil.which('gcc')
    if not gcc or run([gcc, '-dumpfullversion']).stdout.strip() != '15.2.0' or 'x86_64' not in run([gcc, '-dumpmachine']).stdout:
        raise RuntimeError('Install the pinned x64 MinGW GCC 15.2.0 build toolchain first')
    build = ROOT / 'build/obscura'
    build.mkdir(parents=True, exist_ok=True)
    stage = build / ('candidate-' + uuid.uuid4().hex)
    stage.mkdir()
    with zipfile.ZipFile(io.BytesIO(download(LOCK['archive'], 50 * 1024 * 1024))) as archive:
        binary = archive.read(LOCK['archive']['member'])
    (stage / 'obscura.exe').write_bytes(binary)
    run([gcc, '-municode', '-O2', '-Wall', '-Wextra', '-Werror', '-static', '-Wl,--no-insert-timestamp',
         '-o', stage / 'los-reader-host.exe', ROOT / 'native/obscura/reader-host.c',
         '-luserenv', '-ladvapi32', '-lshlwapi'])
    if run([stage / 'obscura.exe', '--version']).stdout.strip() != 'obscura 0.2.5':
        raise RuntimeError('Unexpected release binary version')
    license_bytes = download(LOCK['license'], 65536)
    destination = ROOT / 'resources/native/win32-x64/obscura'
    destination.parent.mkdir(parents=True, exist_ok=True)
    backup = build / ('previous-' + uuid.uuid4().hex)
    if destination.is_symlink():
        raise RuntimeError('Refusing native directory link')
    existed = destination.exists()
    if existed:
        destination.rename(backup)
    try:
        shutil.copytree(stage, destination)
        run([destination / 'los-reader-host.exe', '--prepare'])
        run([destination / 'los-reader-host.exe', '--cleanup'])
        license_dir = destination.parent / 'licenses'
        license_dir.mkdir(exist_ok=True)
        (license_dir / 'obscura-APACHE-2.0.txt').write_bytes(license_bytes)
    except BaseException:
        # This path is fixed below this repository's native resources directory.
        if destination.exists():
            shutil.rmtree(destination)
        if existed:
            backup.rename(destination)
        raise
    print('Obscura 0.2.5 and the Windows containment host installed. Rebuild and restart Synapse.')
    print('Run npm run test:assistant:containment before enabling this build for distribution.')

if __name__ == '__main__':
    main()
