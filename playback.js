// Embedded in each standalone episode; no network request is required.
window.MechanicalPlayback={
 inView(...elements){return elements.some(el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth;});},
 bind({stop,resume,refresh}){
  // A restored document can retain an RAF id whose callback was discarded.
  // Keep the reader's play/pause choice; only renew the browser's clock.
  const recover=()=>{stop();refresh();if(!document.hidden)resume();};
  addEventListener('pagehide',stop);
  addEventListener('pageshow',recover);
  addEventListener('focus',recover);
  document.addEventListener('visibilitychange',recover);
  document.addEventListener('click',event=>{if(event.target.closest('#play,#demo'))recover();},true);
 }
};
