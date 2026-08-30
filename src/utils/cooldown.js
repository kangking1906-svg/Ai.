const m=new Map();function checkCooldown(k,ms){if(!ms||ms<1)return 0;const n=Date.now(),u=m.get(k)||0;if(u>n)return u-n;m.set(k,n+ms);return 0;}module.exports={checkCooldown};
