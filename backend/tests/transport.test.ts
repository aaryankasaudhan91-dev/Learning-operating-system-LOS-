import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createServer} from 'node:http';
import {setupTransport} from '../src/transport';
test('production HTTPS uses the configured origin and trusts only a configured proxy',async t=>{const app=express();assert.throws(()=>setupTransport(app,{production:true,site:'',proxy:''}));setupTransport(app,{production:true,site:'https://synapse.example',proxy:'loopback'});app.get('/check',(_req,res)=>res.json({ok:true}));const http=createServer(app);await new Promise<void>(resolve=>http.listen(0,'127.0.0.1',resolve));t.after(()=>http.close());const address=http.address() as any;const url=`http://127.0.0.1:${address.port}/check`;const redirect=await fetch(url,{redirect:'manual',headers:{Host:'attacker.example'}});assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'https://synapse.example/check');const secure=await fetch(url,{headers:{'X-Forwarded-Proto':'https'}});assert.equal(secure.status,200);assert.match(secure.headers.get('strict-transport-security')||'',/max-age=31536000/)});
