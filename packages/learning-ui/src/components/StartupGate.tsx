import {useCallback,useState,type ReactNode} from 'react';
import SplashScreen from './SplashScreen';
export default function StartupGate({children}:{children:ReactNode}){const[opening,setOpening]=useState(true);const finish=useCallback(()=>setOpening(false),[]);return <><div inert={opening||undefined}>{children}</div>{opening&&<SplashScreen onFinish={finish}/>}</>}
