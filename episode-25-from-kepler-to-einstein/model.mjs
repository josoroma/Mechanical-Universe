import * as Q from '../laboratory/orbits.mjs';
export const DEFAULTS={eccentricity:.2056,amplification:100000},GM=132712440041.279419,C=299792.458,AXIS_KM=57.909e6,AXIS=AXIS_KM/Q.AU_KM,MU=GM*Q.YEAR_SECONDS**2/Q.AU_KM**3,PERIOD=Q.TAU*Math.sqrt(AXIS_KM**3/GM)/Q.YEAR_SECONDS,ARCSEC=180/Math.PI*3600;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function create(p={}){return {...DEFAULTS,...p,t:0};}
export function advance(s,dt){return {...s,t:Math.max(0,s.t+dt)};}
export function shift(e){return 6*Math.PI*GM/(AXIS_KM*(1-e*e)*C*C);}
export function position(s,relativistic=false){const phi=relativistic?shift(s.eccentricity)*s.t*s.amplification:0;return Q.orbit(AXIS,s.eccentricity,MU,Q.TAU*s.t,phi);}
export function snapshot(s){const delta=shift(s.eccentricity),actual=delta*s.t;return {t:s.t,perOrbit:delta*ARCSEC,perCentury:delta*ARCSEC*100/PERIOD,actualArcsec:actual*ARCSEC,shownDegrees:actual*s.amplification*180/Math.PI,elapsedYears:s.t*PERIOD,periodDays:PERIOD*365.25,e:s.eccentricity,amplification:s.amplification,r:position(s).r};}
export function plot(s){const delta=shift(s.eccentricity)*ARCSEC;return {curve:[[0,0],[12,12*delta]],reference:[[0,0],[12,0]],marker:[s.t,s.t*delta]};}
