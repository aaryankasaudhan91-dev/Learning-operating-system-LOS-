import {assertAssistantCloudAllowed,assistantConsent} from '../assistant-privacy';
import express from 'express';
import type {GoogleGenAI} from '@google/genai';
import mongoose from 'mongoose';
import {body,check,text} from '../security';
// Retain the legacy collection model for migration/inspection; it is never charged.
const usageSchema=new mongoose.Schema({uid:String,day:String,count:{type:Number,default:0}},{timestamps:true});
usageSchema.index({uid:1,day:1},{unique:true});
if(!mongoose.models.AiDailyUsage)mongoose.model('AiDailyUsage',usageSchema);
const providerKeys:Record<string,string>={groq:'GROQ_API_KEY',openai:'OPENAI_API_KEY',nvidia:'NVIDIA_API_KEY',anthropic:'ANTHROPIC_API_KEY',gemini:'GEMINI_API_KEY'};
const configured=()=>!!(process.env.AI_MODEL && process.env.AI_PROVIDER && process.env[providerKeys[process.env.AI_PROVIDER] || '']);
export function setupAgentRoutes(app:express.Express,_legacy?:GoogleGenAI|null){
 app.get('/api/capabilities',async(_req,res,next)=>{try{
  const consent=await assistantConsent(res.locals.identity.uid);
  res.json({ai:{configured:consent.cloud?.available===true,enabled:consent.features.cloud,
    reason:consent.cloud?.reason==='READY'&&!consent.cloudConsent?'CONSENT_REQUIRED':consent.cloud?.reason,
    source:'explicit-manual-groq',provider:'groq',models:consent.cloud?.models,noticeVersion:consent.noticeVersion},realtime:true});
 }catch(error){next(error)}});
 // Automatic/background legacy features do not inherit manual-question consent.
 // No provider adapters remain on these routes, preventing accidental fallback.
 for(const route of ['focus','task-hint','insights-prompt','intervention-suggestion','generate-task','sos-chat','guide-chat']){
  app.post('/api/agent/'+route,(req,_res,next)=>{try{
   const input=body(req.body);
   if(route==='focus'||route==='generate-task')text(input.topic,'Topic',500);
   if(route==='task-hint')text(input.title,'Task title',500);
   check(JSON.stringify(input).length<=20000,400,'AI context is too long');
   check(configured(),503,'Live AI is not configured.');
   assertAssistantCloudAllowed();
  }catch(error){next(error)}});
 }
}
