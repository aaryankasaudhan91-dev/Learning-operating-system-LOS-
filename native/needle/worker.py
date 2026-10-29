"""LOS-owned one-request stdin/stdout bridge to the verified Needle 3 C ABI.

This is not an upstream Needle CLI protocol. It never executes a model action.
Native ABI declarations were checked against needle/__init__.py and _worker.py.
Use a pinned matching engine DLL + .cact. Test the frozen Windows build before shipping.
"""
import ctypes as c
import json
import math
import os
from pathlib import Path
import sys

LIMIT = 8192

def normalize(response):
    if not isinstance(response, dict):
        raise ValueError('invalid envelope')
    calls = response.get('function_calls') or []
    if response.get('type') != 'call' or response.get('success') is not True or len(calls) != 1:
        return {'kind': 'unsupported'}
    validation = response.get('validation') or {}
    if validation.get('ungrounded') or validation.get('negation'):
        return {'kind': 'unsupported'}
    call = calls[0]
    if not isinstance(call, dict) or call.get('name') not in ('open_view', 'prepare_focus'):
        return {'kind': 'unsupported'}
    score = response.get('confidence')
    if score is not None and (isinstance(score, bool) or not isinstance(score, (int, float)) or
                              not math.isfinite(score) or score < 0 or score > 1):
        return {'kind': 'unsupported'}
    if score is not None and score < 0.4:
        return {'kind': 'unsupported'}
    # Main process independently revalidates ALL arguments. Always show a proposal.
    return {'kind': 'proposal', 'action': {'name': call['name'], 'arguments': call.get('arguments')},
            'confidence': score}

def infer(text, folder):
    os.environ['NEEDLE_TELEMETRY'] = '0'
    os.environ['DO_NOT_TRACK'] = '1'
    library = folder / 'libneedle.dll'
    model = folder / 'needle3.cact'
    tools = folder / 'tools.json'
    for file in (library, model, tools):
        if not file.is_file():
            raise ValueError('missing artifact')
    # Absolute DLL path; os.add_dll_directory limits dependent-DLL lookup on Windows.
    with os.add_dll_directory(str(folder)):
        lib = c.CDLL(str(library))
        lib.needle_load.argtypes = [c.c_char_p, c.c_uint64]
        lib.needle_load.restype = c.c_int
        lib.needle_init.argtypes = [c.c_char_p, c.c_char_p, c.c_char_p]
        lib.needle_init.restype = c.c_int
        lib.needle_complete.argtypes = [c.c_char_p, c.POINTER(c.c_float), c.c_int,
                                        c.c_int, c.c_char_p, c.c_int]
        lib.needle_complete.restype = c.c_int
        weights = model.read_bytes()
        schemas = tools.read_bytes()
        if lib.needle_load(weights, len(weights)) < 0 or lib.needle_init(b'', schemas, None) < 0:
            raise RuntimeError('init failed')
        output = c.create_string_buffer(65536)
        if lib.needle_complete(text.encode('utf-8'), None, 0, 256, output, len(output)) < 0:
            raise RuntimeError('inference failed')
        return normalize(json.loads(output.value.decode('utf-8')))

def main():
    # Keep native/Python diagnostics off the machine-readable stdout descriptor.
    protocol = os.fdopen(os.dup(sys.stdout.fileno()), 'wb', buffering=0)
    os.dup2(sys.stderr.fileno(), sys.stdout.fileno())
    try:
        payload = sys.stdin.buffer.read(LIMIT + 1)
        if len(payload) > LIMIT:
            raise ValueError('too large')
        data = json.loads(payload)
        if not isinstance(data, dict) or set(data) != {'text'} or not isinstance(data['text'], str):
            raise ValueError('invalid request')
        text = data['text'].strip()
        if not text or '\0' in text or len(text.encode('utf-8')) > 4096:
            raise ValueError('invalid text')
        folder = Path(sys.executable).resolve().parent if getattr(sys, 'frozen', False) else Path(__file__).resolve().parent
        protocol.write(json.dumps(infer(text, folder), allow_nan=False).encode('utf-8'))
        return 0
    except Exception:
        # Never print native details, full paths, prompts, or response reasoning.
        return 1
    finally:
        protocol.close()

if __name__ == '__main__':
    raise SystemExit(main())
