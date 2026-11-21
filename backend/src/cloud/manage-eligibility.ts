/** Trusted operator CLI only. No HTTP endpoint. Never called by the renderer. */
import 'dotenv/config';
import mongoose from 'mongoose';
import {CloudEligibility} from './policy';
import {UserProfileModel} from '../models';
import {CLOUD_AI_NOTICE} from '../../../packages/learning-ui/src/services/assistant.types';
const [operation,uid,expires,...confirmations]=process.argv.slice(2);
if(!['grant','revoke'].includes(operation) || !uid || uid.length>128 ||
  (operation==='grant' && (!expires || !confirmations.includes('--adult-verified') || !confirmations.includes('--region-reviewed')))) {
  throw new Error('Usage: tsx src/cloud/manage-eligibility.ts revoke UID | grant UID YYYY-MM-DD --adult-verified --region-reviewed');
}
if(!process.env.MONGODB_URI)throw new Error('Configure the operator MongoDB connection first.');
try {
  await mongoose.connect(process.env.MONGODB_URI);await CloudEligibility.init();
  if(operation==='revoke')await CloudEligibility.deleteOne({uid});
  else {
    const until=new Date(expires+'T00:00:00.000Z');
    if(!Number.isFinite(until.getTime()) || until.getTime()<=Date.now() || until.getTime()>Date.now()+90*86400000)throw new Error('Expiry must be within the next 90 days.');
    if(!await UserProfileModel.exists({uid}))throw new Error('Account profile does not exist.');
    await CloudEligibility.updateOne({uid},{$set:{adultVerified:true,regionApproved:true,expiresAt:until,policyVersion:CLOUD_AI_NOTICE}},{upsert:true,runValidators:true});
  }
  console.log('Cloud eligibility updated. No provider was contacted.');
} finally {await mongoose.disconnect()}
