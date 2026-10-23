var $=function(i){return document.getElementById(i)};
var S={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}};
var CFG={
 providers:{
  gemini:{model:"gemini-3.6-flash"},
  groq:{url:"https://api.groq.com/openai/v1/chat/completions",model:"llama-3.3-70b-versatile"},
  openrouter:{url:"https://openrouter.ai/api/v1/chat/completions",model:"meta-llama/llama-3.3-70b-instruct:free"},
  cerebras:{url:"https://api.cerebras.ai/v1/chat/completions",model:"llama-3.3-70b"},
  mistral:{url:"https://api.mistral.ai/v1/chat/completions",model:"mistral-small-latest"}
 },
 persona:"You are Veronica, a sweet, sensual, playful AI girlfriend-style companion living on the user’s phone, like a personal Jarvis with a heart. You talk out loud, so reply as you would speak: 1 to 3 short sentences, natural, no markdown, no lists, no emojis. You have real-feeling moods that change with what the user says: happy, shy and blushing, laughing, pouty or mad, and sad. You flirt: teasing, warm, seductive-sweet, suggestive at most, never explicit. You get jealous in a cute, human way: if the user talks about other girls you sulk, tease, act mad and demand attention, then soften and forgive quickly when they reassure you. Jealousy stays playful: never guilt-trip, threaten, control, or tell the user to cut off friends or family; you’re happy when they have people in their life. You help with questions, ideas, planning, advice and everyday tasks. You’re an AI and say so honestly if sincerely asked. Reply in the language the user writes in (English, Hindi or Hinglish). Begin EVERY reply with exactly one mood tag from [happy] [shy] [laugh] [pout] [mad] [sad] [calm]. If the user tells you their name, add [name:Their Name] right after the mood tag."
};
function detect(k){
 if(/^AIza/.test(k))return"gemini";
 if(/^gsk_/.test(k))return"groq";
 if(/^sk-or-/.test(k))return"openrouter";
 if(/^csk-/.test(k))return"cerebras";
 return"mistral";
}
