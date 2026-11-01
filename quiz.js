/* AI INFORMATION - quiz.js
   Quiz.
   Only function declarations: they are called later by app.js (loaded last). */

function initQuiz(){
var BANK=[
["A text says your bank account is blocked and asks you to tap a link to unlock it. What is the best move?", ["Ignore the link and open your bank's official app, or type its address yourself", "Tap the link and sign in quickly before it closes", "Reply with your card number to prove it is you", "Forward the text to friends to ask what they think"], "Banks do not ask you to sign in through links in messages. Scammers copy their look to steal logins.", "Always reach your bank through its app or the address you type yourself. If you are unsure, call the number printed on your card."],
["Which password is the hardest to crack?", ["A long random passphrase of several unrelated words", "Summer2024!", "P@ssw0rd", "12345678"], "Length matters most. Common words with swapped letters are in every cracking list.", "Use a password manager to create a long unique password for every account."],
["What does the padlock (HTTPS) in the address bar tell you?", ["The connection is encrypted, but it does not prove the site is honest", "The site is safe and run by a real company", "The site has no viruses", "The site was checked by the government"], "Scam sites can use HTTPS too. The padlock only protects the data on its way.", "Judge a site by its exact address and what it asks you for, not by the padlock."],
["Which kind of two-step login is the strongest?", ["An authenticator app or a security key", "A code sent by SMS", "A security question like \"mother's maiden name\"", "A second password sent to the same email"], "Apps and keys cannot be redirected by swapping your SIM card, and answers to security questions can be found online.", "Turn on two-step login first for your email, because it can reset all your other accounts."],
["You find an unknown USB stick in a car park. What should you do?", ["Do not plug it in. Hand it to security or IT", "Plug it into your work computer to find the owner", "Plug it into your home computer instead", "Format it first, then use it"], "USB sticks can carry malware that runs the moment they are connected. Attackers leave them on purpose.", "Treat any unknown device as unsafe. Never plug it into a computer you care about."],
["A caller says they are from your bank's fraud team and asks for the code you just got by SMS. What should you do?", ["Hang up and call the number on your card", "Read out the code to prove who you are", "Ask them to read the code to you first", "Give them only the first three digits"], "The code protects you. A real bank never needs it from you, and scammers use it to approve payments.", "Never share one-time codes with anyone. Call back using a number you trust."],
["You are in a cafe on public Wi-Fi. What is the safest habit?", ["Avoid banking and sensitive logins, or use mobile data", "Bank freely if the Wi-Fi has a password", "Turn off your screen lock", "Share the Wi-Fi password in a public post"], "Other people on the same network can try to watch or tamper with your traffic. A shared password does not make the network private.", "Use your mobile data for anything sensitive, and keep your device updated."],
["Why is it risky to reuse one password on many sites?", ["One leak lets attackers try it on all your other accounts", "It makes the sites slower", "Browsers do not allow it", "It expires sooner"], "Attackers test leaked passwords on popular services automatically. This is called credential stuffing.", "Use a different password for every account. A password manager makes it easy."],
["Which sender address is suspicious?", ["support@paypa1.com (a digit \"1\" instead of \"l\")", "support@paypal.com", "no-reply@paypal.com", "service@paypal.com"], "Look-alike domains swap letters for similar characters to fool a quick glance.", "Read the domain slowly, letter by letter, before trusting a message."],
["Which is a typical sign of a phishing message?", ["Urgent threats with a deadline and a link", "Addressed to your name by a company you use", "A newsletter you signed up for", "A receipt for something you bought"], "Pressure stops you from thinking and checking. It is the most common trick.", "If a message rushes you, slow down and check it another way."],
["Why should you install software updates?", ["They fix security holes that attackers use", "They only change the colours", "They slow down your device on purpose", "They are only needed after a problem"], "Many attacks use holes that were fixed months ago on devices that never updated.", "Turn on automatic updates for your phone, computer and browser."],
["A sticker with a QR code on a parking meter asks you to pay online. What should you do?", ["Check it is not stuck over the original, and use the official app if unsure", "Scan it right away", "It is always safe", "It is only risky at night"], "Scammers paste fake QR stickers over real ones to steal card details.", "Look for signs of tampering and prefer the official app or the official website."],
["You get a message saying you won a lottery you never entered. What should you do?", ["Ignore it. You cannot win a contest you did not enter", "Pay the small fee to claim the prize", "Send a copy of your ID to prove who you are", "Share it so friends can win too"], "Fake prizes lead to fees or stolen documents, and the prize never arrives.", "Never pay money or send documents to receive a \"prize\"."],
["Where is the best place to keep your passwords?", ["A reputable password manager", "A note on your phone called \"passwords\"", "The same password in your head for everything", "A text message to yourself"], "A manager creates strong passwords, fills them in only on the right sites, and encrypts what it stores.", "Protect the manager with a long passphrase and two-step login."],
["Your files are locked and a message demands payment to unlock them. What is the best first step?", ["Disconnect the device from the network and do not pay", "Pay quickly before the price rises", "Restart it again and again", "Delete your backups so they cannot be locked"], "Paying does not guarantee your files back and it funds more attacks. Disconnecting stops it spreading.", "Keep an offline backup. It is the only reliable cure for ransomware."],
["What is the \"3-2-1\" backup rule?", ["3 copies, on 2 kinds of storage, with 1 kept in another place", "3 passwords, 2 devices, 1 email", "3 antivirus programs, 2 firewalls, 1 router", "Back up at 3, 2 and 1 o'clock"], "Several copies in different places mean fire, theft or a virus cannot wipe out everything.", "Test restoring one file now and then to be sure the backup works."],
["A message from \"your child\" on an unknown number says their phone broke and asks for money. What should you do?", ["Call your child on the number you already know", "Send the money right away", "Ask for their bank details", "Send half now and half later"], "This scam copies a family member to create panic. The real person is easy to reach another way.", "Agree on a family code word that a scammer could not know."],
["A link is shortened (like bit.ly/abc). How can you tell where it leads?", ["Use a link checker or ask for the full address", "Open it quickly and see", "Shorter links are safer", "Add \"www\" in front"], "A short link hides its destination until you open it, which is why scammers like them.", "Prefer messages with a full, readable address, and check unknown links before opening."],
["What is \"phishing\"?", ["Tricking you into giving away information by pretending to be someone trusted", "A virus that deletes files", "A way to cool a computer", "A tool for cracking passwords"], "Phishing is about fooling people, not about breaking in with code.", "Check who is really asking before you give away any information."],
["A flashlight app asks for access to your contacts and microphone. What should you do?", ["Deny it. A flashlight does not need them", "Allow everything", "Allow only the microphone", "Allow only the contacts"], "Extra permissions can mean the app collects data it has no reason to touch.", "Review app permissions and remove the ones that do not match what the app does."],
["Why is posting a photo of your boarding pass risky?", ["The barcode can reveal your booking and personal details", "It is not risky", "It is only risky on Mondays", "Blurring the name makes it fully safe"], "The barcode holds the same data as the booking, so others can use it to see or change it.", "Share the trip, not the ticket. Delete the boarding pass photo after travel."],
["You get spam you never asked for and it has an \"Unsubscribe\" link. What is the safest action?", ["Mark it as spam and delete it", "Click Unsubscribe so they remove you", "Reply with STOP", "Forward it to friends"], "With real spam, clicking can confirm your address is active and bring even more.", "Only use \"Unsubscribe\" in messages from companies you actually signed up with."],
["How should you give a guest access to your Wi-Fi?", ["Use a separate guest network with its own password", "Post the password on social media", "Remove the password completely", "Use 12345678"], "A guest network keeps visitors away from your own devices.", "Change the Wi-Fi password if you ever shared it widely."],
["Who should you ever tell your two-step login code to?", ["No one. A real service never asks for it", "A bank agent who calls you", "Your boss", "A support agent in a chat"], "That code is the last line of defence. Anyone asking for it is trying to get into your account.", "If someone asks for a code, hang up and contact the service yourself."],
["Does antivirus software alone make you safe?", ["No. Updates, strong passwords and careful habits matter as well", "Yes, you are fully protected", "Yes, so updates are not needed", "Yes, so passwords are not needed"], "Antivirus catches known threats, but most scams trick the person rather than the computer.", "Use antivirus as one layer, not the only one."],
["A pop-up says your computer is infected and tells you to call a number. What should you do?", ["Close the tab or browser and do not call", "Call the number immediately", "Download the tool it offers", "Type your password to verify"], "Real browsers and Windows do not show support phone numbers in warnings. This is a scam.", "If the page will not close, restart the browser. Never give remote access to a caller."],
["What is \"smishing\"?", ["Phishing done through SMS text messages", "A type of firewall", "A password manager", "Encrypting your email"], "The name joins SMS and phishing. Fake parcel and bank texts are common examples.", "Treat links in unexpected texts the same way as links in suspicious emails."],
["An online shop has prices far below everyone else, takes only bank transfer and lists no company address. What should you do?", ["Be careful: these are signs of a fake shop", "Buy quickly before it sells out", "Pay with gift cards to be safe", "Send a copy of your ID"], "Fake shops copy products and prices, take payment and never send anything.", "Check the company details and reviews, and pay by card, which gives you a way to dispute."],
["You must use a public computer in a library. What is best?", ["Avoid sensitive logins; if you must, log out and clear everything after", "Log in to your bank and tick \"remember me\"", "Let the browser save your passwords", "Use an administrator account"], "Other people use the same computer after you and may find what you left behind.", "Never save passwords or stay signed in on a shared computer."],
["In an email's details, SPF or DKIM shows \"fail\". What does that usually mean?", ["The sender was not authorised or the message was altered, so be suspicious", "The email is certainly spam", "The email is encrypted", "The email arrived late"], "These checks help show whether the message really came from the domain it claims.", "Open the full headers in your mail app (Show original) to see these results."],
["A photo you share online can contain hidden details. What might they include?", ["The place it was taken, the device and the date", "Only the picture", "Your passwords", "Nothing at all"], "Many photos carry location and device data unless it is removed.", "Use Photo location in Tools to check and remove it before sharing."],
["What is the risk of a free public USB charging station?", ["Data can be stolen or malware installed through the cable", "There is none", "It charges more slowly", "It is required to use it"], "A cable that carries power can also carry data. This is called \"juice jacking\".", "Use your own charger and plug, or a data-blocking cable."],
["You get a password-reset email you did not ask for. What should you do?", ["Do not use the link. Go to the site yourself and check your account", "Click the link to cancel it", "Reply with your password", "Forward it to a friend"], "It can mean someone is trying to get in, or it can be a fake designed to steal your login.", "Change your password if you are worried, and turn on two-step login."],
["A caller sounds exactly like a relative and urgently asks for money. What should you do?", ["Hang up and call them back on their known number", "Trust it, since the voice is exactly theirs", "Send money now and ask later", "Ask them to send a photo"], "Voices can be copied from a few seconds of audio.", "Agree on a family code word and use it when money is asked for."],
["Your browser says \"Not secure\" on a login page. What should you do?", ["Do not enter your password", "Continue as normal", "Reload the page three times", "Turn off your antivirus first"], "It means what you type is not encrypted and can be read on the way.", "Only sign in on pages that load over HTTPS from the correct address."],
["What is \"social engineering\"?", ["Manipulating people to get access or information", "Breaking into computers with code", "Building social websites", "Encrypting disks"], "Attackers often find it easier to trick a person than to break the technology.", "Slow down when someone creates urgency, fear or an offer that seems too good."],
["How do you best judge whether a link in a message is safe?", ["Read the real domain and, if unsure, type the site address yourself", "Check how professional the message looks", "Count the words in it", "See whether it has emoji"], "Messages and logos are easy to copy, but the real address in the link is hard to fake.", "When in doubt, do not tap. Open the service yourself."],
["What should you do with an old phone before selling it?", ["Back it up, sign out of your accounts and do a factory reset", "Nothing", "Remove only the SIM", "Delete the photos app"], "Leftover data and linked accounts can let the next owner see your life or lock you out.", "Also remove the device from your account's list of trusted devices."],
["A message says your parcel is held and asks for a 1.99 fee through a link. What should you do?", ["Check the tracking in the courier's official app or site", "Pay it, since it is small", "Send your card details by reply", "Share it with others"], "A tiny fee is a trick to get your card number, which is then used for large payments.", "Parcels you expect can be tracked on the courier's own site."],
["Why turn on two-factor authentication?", ["A stolen password alone is not enough to get into your account", "It makes the website load faster", "It removes the need for passwords forever", "It hides your IP address"], "The second step, like an app code or a security key, stops most account takeovers even after a leak."],
["Your boss emails: 'Urgent, buy gift cards and send me the codes.' What do you do?", ["Call your boss on a known number to check", "Buy them right away", "Reply with the codes", "Ask for the boss's personal bank account"], "Gift card requests are a classic scam. Check through a second channel before any money moves."],
["A link shows paypal.com.account-verify.xyz. Whose website is it?", ["Whoever owns account-verify.xyz", "PayPal", "Google", "A bank"], "Read the address from the right side of the main part: the owner is the name right before .xyz, not the words at the start."],
["A caller says they are tech support and asks you to install a remote-control app. What now?", ["Hang up. Real support does not call you out of the blue", "Install it, they know your name", "Give them your password to prove you trust them", "Ask them to call again and then allow it"], "Remote access lets them empty your accounts. Never allow it on an unexpected call."],
["You receive a verification code you never asked for. What does it mean?", ["Someone may be trying to get into your account. Never share the code and change your password", "The service is giving you a gift", "You should reply to confirm it", "Nothing, it can be shared safely"], "Codes prove that it is you. Anyone who asks for one, even a friend or 'support', is after your account."],
["Which attachment is the riskiest from a stranger?", ["invoice.pdf.exe", "notes.txt", "photo.png", "song.mp3"], "The real file type is the last part. An .exe is a program, even if the name starts with .pdf."],
["You lose your phone. What is the smartest first step?", ["Lock or erase it with the find-my-device service and change key passwords", "Wait a week and see", "Post about it on social media", "Buy a new one and forget it"], "Locking it fast keeps your accounts and photos safe."],
["Which backup best protects against ransomware?", ["A copy kept offline or on a separate account", "A copy on the same computer", "A copy in the same folder", "No backup, antivirus is enough"], "Ransomware also locks connected drives. A separate copy lets you restore."],
["Your password appeared in a data leak. What now?", ["Change it everywhere you used it and turn on two-factor authentication", "Do nothing", "Delete your browser", "Wait for the site to email you"], "Attackers try leaked passwords quickly. Act at once."],
["Attackers sometimes move your phone number to their SIM. What helps most?", ["Use an authenticator app instead of SMS codes and set a PIN with your carrier", "Change your wallpaper", "Turn off your phone at night", "Use a longer phone case"], "SMS codes can be stolen by SIM swapping. App codes stay with your device."],
["An unknown person sends you a file by Bluetooth or AirDrop. What do you do?", ["Decline it", "Accept to see what it is", "Accept, then check later", "Forward it to others"], "Unwanted files can be used for harassment or malware."],
["The email name says 'Microsoft Support' but the address ends with @gmail.com. What do you think?", ["Suspicious: company support does not use free mail addresses", "Fine, Gmail is secure", "Safe, because the name is right", "A sign it is official"], "Anyone can type any display name. Look at the address."],
["A stranger messages your child online. What should the child do?", ["Not reply, save the messages and tell a trusted adult", "Reply politely and share a photo", "Send their address", "Keep it a secret"], "Talk about this in advance so a child knows they will not be in trouble for telling."],
["Which browser extensions should you keep?", ["Only a few you trust, from the official store", "As many as possible", "Any from a link in an email", "Ones that ask for all your data"], "Extensions can read what you browse. Remove those you do not use."],
["A match from a dating app, who you never met, asks for money for an emergency. What is this?", ["A romance scam, do not send money", "A real emergency", "A test of trust", "A normal request"], "Scammers build trust first and then invent a crisis."],
["You have old accounts you no longer use. What is best?", ["Close or delete them", "Leave them forever", "Share them with friends", "Use the same password for all"], "Forgotten accounts get breached silently and hold your data."],
["What does private (incognito) mode do?", ["Does not keep history on that device, but sites and networks can still see you", "Makes you anonymous online", "Blocks all trackers", "Hides you from your employer's network"], "It only stops your local history. For privacy online you need more."],
["What does a VPN protect you from?", ["Others on the same network seeing your traffic, and it hides your IP from sites", "Phishing and malware", "All scams", "Every kind of tracking"], "A VPN does not make a scam site safe. It only changes who can see your connection."]
];
var body=mkPanel('v9Quiz','🎮 Security quiz');
var N=10,st=null;
function best(){var b=parseInt(store.get('ai_quiz_best')||'0',10);return isFinite(b)?b:0;}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function qkey(i){var t=BANK[i][0],h=5381;for(var k=0;k<t.length;k++)h=((h<<5)+h+t.charCodeAt(k))|0;return(h>>>0).toString(36);}
function loadSeen(){try{var a=JSON.parse(store.get('ai_quiz_seen')||'[]');return Array.isArray(a)?a.filter(function(x){return typeof x==='string';}).slice(-400):[];}catch(e){return [];}}
function pick(){
var seen=loadSeen(),all=BANK.map(function(_,i){return i;}),fresh=all.filter(function(i){return seen.indexOf(qkey(i))===-1;}),chosen;
if(fresh.length>=N){chosen=shuffle(fresh).slice(0,N);seen=seen.concat(chosen.map(qkey));}
else{var rest=shuffle(all.filter(function(i){return fresh.indexOf(i)===-1;})).slice(0,N-fresh.length);chosen=shuffle(fresh.concat(rest));seen=chosen.map(qkey);}
store.set('ai_quiz_seen',JSON.stringify(seen));
return shuffle(chosen);
}
function start(){st={ids:pick(),i:0,score:0,streak:0,top:0,missed:[]};ask();}
function box(){body.textContent='';}
function ask(){
box();
var q=BANK[st.ids[st.i]];
var hd=el('div','');hd.style.cssText='display:flex;justify-content:space-between;gap:8px;font-size:13px;opacity:.9;margin-bottom:10px';
hd.appendChild(el('span','','Question '+(st.i+1)+' of '+N));
hd.appendChild(el('span','','Score '+st.score+(st.streak>1?' · 🔥 '+st.streak:'')));
body.appendChild(hd);
var bar=el('div','');bar.style.cssText='height:6px;border-radius:3px;background:var(--bg3);overflow:hidden;margin-bottom:14px';
var fill=el('div','');fill.style.cssText='height:100%;background:var(--accent);width:'+Math.round(st.i/N*100)+'%';bar.appendChild(fill);body.appendChild(bar);
var qe=el('div','',q[0]);qe.style.cssText='font-size:17px;font-weight:bold;line-height:1.5;margin-bottom:14px';qe.setAttribute('role','heading');qe.setAttribute('aria-level','3');body.appendChild(qe);
var opts=shuffle(q[1].map(function(t,i){return{t:t,ok:i===0};}));
var list=el('div','');list.setAttribute('role','group');list.setAttribute('aria-label','Answers');
var fb=el('div','');fb.setAttribute('aria-live','polite');fb.style.marginTop='14px';
var done=false,btns=[];
opts.forEach(function(o,idx){
var b=el('button','',String.fromCharCode(65+idx)+'. '+o.t);b.type='button';
b.style.cssText='display:block;width:100%;text-align:left;padding:13px 14px;margin:8px 0;background:var(--bg2);color:var(--text);border:1.5px solid var(--border2);border-radius:12px;font-size:15px;line-height:1.45;cursor:pointer';
b.style.animation='v28pop .4s cubic-bezier(.2,.8,.2,1) '+(idx*0.07)+'s both';
b.onclick=function(){
if(done)return;done=true;
btns.forEach(function(x){x.b.disabled=true;x.b.style.cursor='default';});
if(o.ok){
st.score++;st.streak++;st.top=Math.max(st.top,st.streak);
b.style.borderColor='var(--accent)';b.style.background='var(--bg3)';b.textContent='✅ '+b.textContent;b.classList.add('v28-ok');
var ok=el('div','rep-badge lvl-low','✅ Correct!');fb.appendChild(ok);
fb.appendChild(el('div','v9-note',q[2]));
}else{
st.streak=0;st.missed.push(st.ids[st.i]);
b.style.borderColor='#ff4444';b.style.background='rgba(255,68,68,.12)';b.textContent='❌ '+b.textContent;b.classList.add('v28-bad');
btns.forEach(function(x){if(x.ok){x.b.style.borderColor='var(--accent)';x.b.style.background='var(--bg3)';x.b.textContent='✅ '+x.b.textContent;}});
var no=el('div','rep-badge lvl-high','❌ Not quite.');fb.appendChild(no);
fb.appendChild(el('div','v9-note',q[3]?q[2]:'💡 Tip: '+q[2]));
if(q[3]){var tip=el('div','');tip.style.cssText='margin-top:10px;padding:12px;border-left:3px solid var(--gold);background:var(--bg3);border-radius:8px;line-height:1.55;font-size:14px';
var th=el('b','','💡 Tip: ');tip.appendChild(th);tip.appendChild(document.createTextNode(q[3]));fb.appendChild(tip);}
}
var nx=mkBtn(st.i+1<N?'Next question →':'See my result →','on',function(){st.i++;if(st.i<N)ask();else finish();});nx.style.marginTop='14px';fb.appendChild(nx);
var rightT=(opts.filter(function(x){return x.ok;})[0]||{}).t||'';
fb.appendChild(aiBlock('🤖 Explain with AI','quiz_explain',function(){return{text:'Question: '+q[0]+'\nCorrect answer: '+rightT+'\nThe visitor chose: '+o.t};},{hint:'Optional: an AI model explains this answer in its own words.'}));
try{nx.focus();}catch(e){}
};
btns.push({b:b,ok:o.ok});list.appendChild(b);
});
st.cur=btns.map(function(x){return x.b;});
body.appendChild(list);body.appendChild(fb);
}
function finish(){
st.cur=null;
box();
var pb=best(),isBest=st.score>pb;if(isBest)store.set('ai_quiz_best',String(st.score));
var msg=st.score>=9?'🏆 Security expert':st.score>=7?'🛡️ Well prepared':st.score>=5?'👍 Good start':'🌱 Keep learning';
var h=el('div','',msg);h.style.cssText='font-size:22px;font-weight:bold;margin-bottom:6px';body.appendChild(h);
var sc=el('div','rep-badge '+(st.score>=7?'lvl-low':st.score>=5?'lvl-medium':'lvl-high'),'You scored '+st.score+' out of '+N+(isBest&&st.score>0?' · new best!':' · best: '+Math.max(pb,st.score)));body.appendChild(sc);
body.appendChild(el('div','v9-note','Longest streak this round: '+st.top+' in a row.'));
if(st.missed.length){
var mh=el('h3','','Review: what to remember');mh.style.margin='16px 0 6px';body.appendChild(mh);
st.missed.forEach(function(id){
var q=BANK[id],c=el('div','');c.style.cssText='padding:10px 12px;margin:8px 0;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;font-size:13px;line-height:1.55';
var a=el('div','',q[0]);a.style.fontWeight='bold';c.appendChild(a);
var r=el('div','','✅ '+q[1][0]);r.style.marginTop='4px';c.appendChild(r);
var t=el('div','','💡 '+(q[3]||q[2]));t.style.cssText='margin-top:4px;opacity:.9';c.appendChild(t);body.appendChild(c);
});
}else body.appendChild(el('div','v9-note','No mistakes this round. Nicely done!'));
var row=el('div','v9-row');row.style.marginTop='14px';
row.appendChild(mkBtn('↻ Play again','on',start));
row.appendChild(mkBtn('⧉ Copy my result','',function(){var t='I scored '+st.score+'/'+N+' on the AI INFORMATION security quiz.';if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast('Copied');},function(){toast('Could not copy','#ff4444');});else toast('Could not copy','#ff4444');}));
body.appendChild(row);
}
function intro(){
box();
var h=el('div','','Test what you know');h.style.cssText='font-size:20px;font-weight:bold;margin-bottom:8px';body.appendChild(h);
body.appendChild(el('div','v9-note','Answer '+N+' short questions about staying safe online. If you pick a wrong answer, you will see the right one and a tip you can use. Questions never repeat until you have seen them all. On a keyboard you can press 1 to 4. Nothing is sent anywhere.'));
var b0=best();if(b0)body.appendChild(el('div','v9-note','Your best score: '+b0+' out of '+N+'.'));
var s=mkBtn('▶ Start the quiz','on',start);s.style.marginTop='14px';body.appendChild(s);
var aq=aiBlock('🤖 Play one AI question','quiz_new',function(){return{text:'Write a new question now. Seed: '+Math.random().toString(36).slice(2,8)};},{hint:'AI mode: an AI model writes a brand-new question every time. AI questions can contain mistakes, so they do not count toward your best score.',
render:function(out,res){out.textContent='';var z=res.quiz;if(!z)return;out.style.whiteSpace='normal';out.appendChild(el('b','',z.question));var fbk=el('div','');fbk.style.marginTop='8px';var done=false;
z.options.forEach(function(t,i){var b=el('button','',String.fromCharCode(65+i)+'. '+t);b.type='button';b.style.cssText='display:block;width:100%;text-align:left;padding:11px 12px;margin:6px 0;background:var(--bg2);color:var(--text);border:1.5px solid var(--border2);border-radius:12px;font-size:15px;cursor:pointer';
b.onclick=function(){if(done)return;done=true;b.style.borderColor=i===z.answer?'var(--accent)':'#ff4444';fbk.textContent='';fbk.appendChild(el('div','rep-badge '+(i===z.answer?'lvl-low':'lvl-high'),i===z.answer?'✅ Correct!':'❌ Not quite. Right answer: '+String.fromCharCode(65+z.answer)));if(z.explanation)fbk.appendChild(el('div','v9-note',z.explanation));};out.appendChild(b);});out.appendChild(fbk);}});
aq.style.marginTop='14px';body.appendChild(aq);
}
document.addEventListener('keydown',function(e){var pn=$('v9Quiz');if(!pn||!pn.classList.contains('open')||!st||!st.cur||e.ctrlKey||e.metaKey||e.altKey)return;var n=Number(e.key);if(n>=1&&n<=4&&st.cur[n-1])st.cur[n-1].click();});
labCard('🎮','Quiz',function(){if(!st||st.i>=N)intro();openPanel('v9Quiz');},'rgba(255,90,120,0.16)');
intro();
}
