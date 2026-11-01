/* AI INFORMATION - legal.js
   legal pages (terms, privacy, cookies...).
   Only function declarations: they are called later by app.js (loaded last). */

/* ===================== v42: legal pages, cookie/storage choices, location explanation, feed cache size ===================== */
function initLegal(){
var UPDATED='18 October 2026';
/* ---- fill these in: they are shown in the Imprint and the Privacy Policy ---- */
var CONTACT='ai.information.support@gmail.com';
var OP={
name:'Георги Бойков Василев (George)',
address:'[street, postcode, city, country]',
email:'ai.information.support@gmail.com',
phone:'[phone number – optional]',
register:'[company register / VAT number – only if you are a business]',
country:'Bulgaria'
};
var NOTES=[
'Translations: all translations on this site are made by open translation services and AI models (see the list in the Language panel), not by us. They are machine translations and can be wrong.',
'No age check: the site does not ask for your age and cannot check it. It is a free, volunteer-made project and has no money or tools for ID checks. It is meant for people aged 13 and over; younger children should use it only with a parent or guardian. A content filter is on by default and you can change it with the Filter button.',
'No payments: the site has no way to pay and does not ask for money or card details. Everything is free and made voluntarily.',
'Mistakes: the site is looked after by one person and not everything is perfect. It may break a rule or law by mistake, without the owner knowing. If you tell the owner, it will be looked at and fixed.',
'Memory: the site cannot promise that everything is remembered. Settings and chats are kept only on your device and only if you allow storage; the server keeps no copy. Clearing browser data, refusing cookies/storage, or a browser that blocks them can erase them, and long chats are cut to the last few messages.',
'Source files: all the files this site works with are public on GitHub: https://github.com/GeorgeMasterBG/AI-INFORMATION . Anyone can read them. Copies of the site that are not at the official addresses are not run by the owner, so check the address before you trust a copy.',
'Made with AI help: some parts of the site, including parts of its code, were written with the help of AI. That does not mean those parts use AI while you use the site. Most features use ordinary scripts and fixed answers. A few can use a real AI model, namely AI Chat, AI Tip, voice input and some translations, which run on Cloudflare Workers AI (an open model, not ChatGPT). AI answers are marked “🤖 AI model” and can be wrong.',
'HTML for bots: most of the site is JavaScript, which many bots and AI assistants cannot run. So the page also contains a plain HTML text, not shown on screen, that describes the whole site. This HTML is the tool by which bots review the site. It changes nothing for visitors.',
'AI helpers: the optional AI buttons (translator, dictionary, calculator, weather, compare, quote, quiz, Scam Lab tools, video finder, children filter, chat with a picture or file) send only the text, picture or file you choose to our script and on to Cloudflare Workers AI. Nothing is sent for a button you do not press; the automatic summaries send the shown titles and snippets and are off for under-18 profiles. AI answers can be wrong.',
'Purpose: the site does not want to compete with anyone or win anything. It is just one more small tool that can be useful in everyday life.'
];
function sec(body,title,parts){
body.appendChild(el('h3','lg-h',title));
parts.forEach(function(p){
if(typeof p==='string'){body.appendChild(el('p','lg-p',p));return;}
var ul=el('ul','lg-ul');p.forEach(function(x){var li=el('li','',x);ul.appendChild(li);});body.appendChild(ul);
});
}
function doc(id,title,fn){
var b=mkPanel(id,title);b.parentNode.id=id;b.classList.add('lg-doc');
b.appendChild(el('div','v9-note','Last updated: '+UPDATED+'. This text is written in plain English and is a general description of what this site really does. It is not legal advice.'));
fn(b);
var ct=el('p','lg-p','✉️ Contact: ');var ca=el('a','',CONTACT);ca.href='mailto:'+CONTACT;ct.appendChild(ca);b.appendChild(ct);
var close=mkBtn('Close','',function(){closePanel(id);});close.style.cssText='margin:16px 0 4px';b.appendChild(close);
}
/* ---------------- Privacy Policy ---------------- */
doc('v9Privacy','🔒 Privacy Policy',function(b){
sec(b,'1. Short version',[
['No ads, no analytics, no tracking cookies, no profiling, no selling of data, no accounts.',
 'The site works without giving us your name or e-mail address.',
 'Anything saved on your device (settings, offline cache) is saved only after you allow it in the cookie / storage choices, and you can change your mind at any time.']
]);
sec(b,'2. Who is responsible',[
'The operator of this website is Георги Бойков Василев (Georgi Boykov Vasilev, known as George), a private person (not a company), living in Bulgaria. You can contact the operator at the e-mail address in the Imprint (footer link) about anything in this policy.'
]);
sec(b,'2a. How this site works, in plain words',[
['The page you see is a program (JavaScript) that runs inside your own browser, on your own device. It is the same code for everyone and it is only there to run the searches and tools you ask for. It does not read what you type anywhere else, does not ask for passwords or payment details, does not show fake login pages, and does not do anything you did not ask for.',
 'The “server” is a small script on Cloudflare. It does two things: it delivers the site files when you open the page (every website needs a host for that, and it is not a sign that data is being taken), and for some features it fetches public information from the internet for the words you searched, then gives the answer back to you. It has no accounts, no database of visitors and does not keep your searches. It may briefly keep a copy of a public answer so the next request is faster.',
 'What you type is handled in your browser first. When a feature needs outside information, the words needed for that feature are sent to our script or straight to the public source it names in section 5. Nothing is sent for a feature you do not use.',
 'No system is perfectly safe, so we do not promise that the risk is zero. What we do: HTTPS, a strict content-security policy, no third-party scripts, and no ads or trackers. If you notice anything unexpected, write to the e-mail address in the footer.']
]);
sec(b,'2b. Optional AI helpers and what they send',[
'These helpers are optional. Each one sends data only when you press its button (or when you switch on its automatic option): Translator and Dictionary send the text or word you typed; Calculator sends your question; Weather Scout sends the place name you typed or chose (and lets the AI search the internet for it); Compare, Quote, Quiz and the Scam Lab tools send the text, links, e-mail headers or image you give them; AI Chat sends your message and, if you attach one, a picture or file; the video finder sends your wish and the titles of free videos the script found; the children filter sends result titles and short snippets; AI Summary sends the shown titles and snippets; “For you” in Standard Search sends your last searches (kept on your device); the AI summary of the day in the Feed sends the headlines shown in the feed (public news, not your data); the two-day comparison sends the saved titles and short descriptions of one topic you searched; the AI picture background sends your picture description to an AI image model (Workers AI) and keeps the finished picture on your device.',
'The data goes to our Cloudflare script and from there to Cloudflare Workers AI, which runs the model. Our script does not store it. Pictures and files are read only by the AI model: the site never opens, runs or follows them, and an attached file cannot start anything else on the site. Cloudflare may process it under its own terms. Do not send secrets, passwords or other people\'s private data.',
'You can switch automatic AI summaries off in the summary box. The AI children filter runs only if you switch it on with the Filter button.',
'AI answers can be wrong, out of date or made up. They are not advice and not a verdict. Check the sources.'
]);
sec(b,'3. What happens when you open the site',[
'The site is delivered by Cloudflare (Cloudflare Pages / Workers). When your device asks for the page or for data from the site, Cloudflare necessarily processes technical data: your IP address, the time, the address requested, and browser information (user agent). This is needed to deliver the site, keep it secure and stop abuse. The legal basis is our legitimate interest in a secure, working site (Art. 6(1)(f) GDPR). Cloudflare is a separate service provider and keeps its own technical logs under its own privacy policy (cloudflare.com/privacypolicy).',
'From your IP address Cloudflare tells the site your approximate country, and sometimes your approximate city and coordinates. The site uses this only to pick the right country for the feed and an approximate place for the weather chip. It is not stored by the site and not combined with anything else.'
]);
sec(b,'4. What is saved on your device (cookies and similar)',[
'⚠️ Even if you reject everything here, your browser and the services that deliver this site may still keep their own cache files or set their own cookies. These are not set by the site itself: your browser’s normal HTTP cache keeps copies of site files, and the hosting provider (Cloudflare) can set technical cookies or logs for security and delivery. We do not control them. You can delete them in your browser settings. The Feed cache does not collect personal data: it only stores images so they can be shown faster. If you see a website setting third-party cookies, that comes from that website’s own policy, not from this site.',
'This site itself sets no cookies. It uses your browser’s storage (localStorage, the Cache API and a service worker). Under EU rules this is treated like cookies, so you choose:',
['Necessary (always on): one small record of your choice below (ai_consent) so that we do not ask you every time. It holds your choices, the time you made them, and whether you have seen the welcome message.',
 'Preferences (only if you allow): language, light/dark theme, video quality, the city you picked for the weather, quiz progress, recent searches, your own activity list and similar settings. Nothing in it is sent to us.',
 'Offline cache (only if you allow): the service worker and a cache with the site files, the latest feed/search answers and the videos you or the feed downloaded, up to the size you choose. They never leave your device. You choose the size in the Feed (💾 Cache) and can clear it there.'],
'If you refuse, the site still works. Your settings are then kept only until you close the tab. You can change your choice any time with “Cookie settings” in the footer, and you can delete all stored data with “Quick clear”. Legal basis for the optional storage: your consent (Art. 5(3) ePrivacy Directive and Art. 6(1)(a) GDPR).'
]);
sec(b,'5. Features that contact other services',[
'Some features only work by asking other services. When that happens, that service can see your IP address and what is sent to it. We do not control them. What is sent, per feature:',
['Search and source checks: your search words go to our server, which asks public sources (for example Wikipedia and Wikimedia, DuckDuckGo instant answers, Hacker News, GDELT news). In Standard Mode your browser can also ask other free sources directly with your search words: other Wikimedia projects (Wikibooks, Wikisource, Wikinews, Wiktionary, Wikiversity, Wikivoyage, Wikiquote, Wikispecies, Wikidata and other language editions of Wikipedia), Internet Archive, Open Library, Project Gutenberg, Google Books, Library of Congress, Crossref, OpenAlex, Europe PMC, DOAJ, Semantic Scholar, INSPIRE, Zenodo, DataCite, Stack Exchange sites, GitHub, npm, Spaceflight News, GBIF, iNaturalist, Cleveland Museum of Art, MusicBrainz, OpenStreetMap (Nominatim), REST Countries, TheMealDB, Open Food Facts, Openverse, NASA and the Art Institute of Chicago. Their own privacy policies apply to those requests.',
 'Feed and videos: our server collects public posts and free-licensed videos from sources such as Wikipedia, Hacker News, Lobsters, DEV, Mastodon, Lemmy, Stack Exchange, news RSS feeds (BBC, NPR, DW, Al Jazeera, NASA and others), Wikimedia Commons, the Internet Archive, NASA and PeerTube servers (and Pexels / Pixabay if the operator added a key). Your browser then loads pictures and videos directly from those hosts, so they see your IP address.',
 'Weather: the weather chip at the top loads by itself for an approximate place (found from your network by Cloudflare) or for the city you chose. The coordinates go to Open-Meteo. When you press “My location” your browser asks you for permission first. If it cannot give a location, an approximate one may be looked up from your IP address with ipwho.is.',
 'Language and Translator: the texts to translate go from your browser to our server (the Cloudflare Worker that runs this site), which asks free open translation services in turn (LibreTranslate instances such as libretranslate.de, Apertium, MyMemory) and then AI models on Cloudflare Workers AI. If your browser has its own on-device translator (Chrome), it can be used too and stays on your device. The site does not use the unofficial Google Translate interface. After a language is chosen, the original texts and their translations are also sent to our server, which asks a second translation service for the same texts and lets an AI model on Workers AI approve one version. For Language these are the visible texts of the site, not your own input; the Translator sends what you type. The list of sources is shown in the Language panel. If you translate a website with the Translator, its address goes to the text reader r.jina.ai, which fetches the page text.',
 'Dictionary: the word goes to our server and then to Wiktionary.',
 'AI Summary in Standard Search (the “✨ AI Summary” bubble): after a search the summary is written automatically, unless you turn that off in the bubble or you chose an age group under 18. Your search words and the titles, snippets and links of the results on screen go to our server and to Cloudflare Workers AI, which writes the summary. With automatic summary off, nothing is sent until you press the bubble.',
 'AI Chat and AI Tip: your message goes to our server and is processed by Cloudflare Workers AI (an open model such as Google Gemma or Meta Llama), together with public web results. Cloudflare runs the model; the site does not keep the conversation on its server. Do not type personal data into the chat.',
 'Scam Lab and link scanner: the address you check goes to our server, which checks it against public security services (for example URLhaus, Google Safe Browsing, VirusTotal and Cloudflare DNS filters), if they are set up on the server.',
 'Scam Lab without our server: if our server cannot be reached, your browser may check the domain name directly with public DNS-over-HTTPS services (Cloudflare, and Google as a backup). Only the domain name you entered is sent, and those services see your IP address.',
 'Notifications: only if you press the button and allow them in your browser. The reminder is created and shown on your device by the browser; the site does not use a push server and nothing about it is sent to us.',
 'Voice input: if you use the microphone, your browser’s speech service (for example Google in Chrome) or Cloudflare Workers AI turns speech into text. Audio is used only while you press the button.',
 'Links you open (for example the VirusTotal report, Beta site, Google Translate) lead to other websites with their own privacy policies.'],
'The legal basis is that you asked for the feature (Art. 6(1)(b) and (f) GDPR). If you do not use a feature, nothing is sent for it.'
]);
sec(b,'6. How long',[
'The site itself keeps no database of visitors. Data on your device stays until you delete it, change your choice, or the browser removes it. Cloudflare and the other services keep their own logs for their own periods.'
]);
sec(b,'7. Transfers outside the EU',[
'Cloudflare, Google and some of the other services named above are based in, or run servers in, the United States. They normally rely on the EU–US Data Privacy Framework or standard contractual clauses for such transfers.'
]);
sec(b,'8. Your rights',[
'You have the right to access, correct, delete, restrict and move your personal data, to object to processing based on legitimate interest, and to withdraw consent at any time (the withdrawal does not affect what was done before). Because the site keeps no account or database about you, most of your data is only on your own device, where you can delete it yourself with “Cookie settings” and “Quick clear”.',
'You can complain to a data-protection authority. The operator lives in Bulgaria, where the authority is the Commission for Personal Data Protection (cpdp.bg). You can also contact the authority in the country where you live.'
]);
sec(b,'9. Children and the content filter',[
'The site has no age check and does not ask how old you are. It is meant for people aged 13 and over, and children should use it only with a parent or guardian. A content filter that hides adult, violent, drug and gambling content is on by default; the Filter button switches it on or off, and the choice is saved on your own device only. The filter is not perfect. Please do not send us personal data.'
]);
sec(b,'10. If you live in the United States (CCPA/CPRA and other state privacy laws, COPPA)',[
'We do not sell or share your personal information, we do not use it for targeted advertising or profiling, and we do not collect sensitive personal information. The site has no accounts. The only things we may see are the technical data every web server sees (such as your IP address) and the words you type into features that need our server (see section 5).',
'If a law in your state gives you rights (to know, delete, correct, or opt out), you can use them by writing to the e-mail address below. The data kept on your own device you can see and delete yourself in your browser settings or with the Clear tool on the site.',
'Opt-out signals: if your browser sends a Global Privacy Control (GPC) signal, we treat it as a request not to allow optional storage. Optional storage stays off unless you choose it yourself in the privacy choices.',
'Children (COPPA): this site is not directed to children under 13 and does not ask for age or any personal data. We do not knowingly collect personal information from children under 13. If you think a child has given us personal information, write to us and we will delete it.'
]);
sec(b,'11. Artificial intelligence',[
'AI Chat, AI Tip, voice input and some translations can use a real AI model: an open model (Google Gemma, Meta Llama and similar) run by Cloudflare Workers AI. It is not ChatGPT and not made by the site owner. The rest of the site mostly uses ordinary scripts, rules and public sources. Answers from the AI model are marked “🤖 AI model”, can be wrong, and are not professional advice. You are always talking to a machine, not a person. Do not put personal data in the chat. The EU AI Act asks us to tell you when you are dealing with AI, and we do.'
]);
sec(b,'12. Security and changes',[
'The site is delivered over HTTPS and uses a strict content-security policy. We may update this policy when the site changes; the date at the top shows the latest version.'
]);
});
/* ---------------- Terms ---------------- */
doc('v9Terms','📜 Terms of Use',function(b){
sec(b,'1. About the service',[
'AI INFORMATION is a free information tool: it helps you look at where information comes from, scan links, translate text, watch free-licensed videos and read public posts. By using it you accept these terms. If you do not agree, please do not use the site.'
]);
sec(b,'2. Information only – no guarantee',[
'Results come from public third-party sources and from automatic tools (including AI and machine translation). They can be wrong, incomplete or out of date. Source checks, scores and scam warnings are indications, not proof, and are not legal, medical, financial or security advice. Always check important things yourself.'
]);
sec(b,'3. Third-party content and licences',[
'Videos, pictures and posts belong to their authors and are shown with their source and licence. The feed and the video lists show only items with a free licence (for example Creative Commons or public domain); paid, rented, “all rights reserved” or fair-use items are left out. Free licences still have conditions, such as naming the author or not using the work commercially. When you download or share an item, you must follow its licence. Links lead to other websites that we do not control.'
]);
sec(b,'4. Acceptable use',[
['Do not use the site to break the law, harm others, attack or overload the site or the services it uses, or to collect data about private persons.',
 'Do not use results to harass, mislead or defraud anyone.',
 'Do not try to bypass the technical protections of the site.']
]);
sec(b,'5. Reporting illegal content',[
'The site does not host user-generated content; items come from third parties. If you think something shown here is illegal or breaks your rights, write to the e-mail address in the Imprint with the link to the item, what is wrong and why, and your name and e-mail. We will look at it and, where justified, remove it from the lists.'
]);
sec(b,'5a. Copyright notices (DMCA and EU)',[
'The site does not store or host third-party videos, pictures or texts; it shows excerpts, titles and links from public sources with a free licence. If you are a rights holder and think something shown breaks your copyright, e-mail us with: what the work is, where it is shown here (the link), your name and contact details, a statement that you act in good faith and that your information is correct, and, for a US notice, a statement under penalty of perjury that you are the owner or authorised to act, and your signature (typed is fine). We will remove or hide the item quickly and tell the person who objects, if there is one.'
]);
sec(b,'5b. Artificial intelligence',[
'Most features use ordinary scripts and fixed answers. AI Chat, AI Tip, voice input and some translations can use an open AI model run by Cloudflare Workers AI; its answers are marked “🤖 AI model”. Answers can be wrong or incomplete and are not professional, legal, medical or financial advice. Do not rely on them alone.'
]);
sec(b,'6. Availability and changes',[
'The site is provided “as is” and “as available”. Features can change, stop working or be removed, for example when a free source changes or limits its service. The Beta version can differ from the main version and may have unfinished features.'
]);
sec(b,'7. Liability',[
'We are liable without limit for intent, gross negligence, injury to life, body or health, and wherever the law does not allow a limit, including your mandatory consumer rights. Otherwise, as far as the law allows, we are not liable for losses from using free information, third-party content, or from the site being unavailable.'
]);
sec(b,'8. Ownership',[
'The design, text and code of the site belong to the operator, unless marked otherwise. Names and logos of other services belong to their owners and are used only to say where data comes from.'
]);
sec(b,'9. Age limits',[
'The site is meant for people aged 13 and over; younger children should use it only with a parent or guardian. The site has no age check and cannot verify anyone\'s age. The content filter is on by default but is not perfect, and parents remain responsible for what a child on their device sees.'
]);
sec(b,'9a. Honest notes about this project',[NOTES]);
sec(b,'10. Law and changes',[
'These terms are governed by the law of '+OP.country+', without taking away the mandatory consumer-protection rules of the country where you live. If one part is invalid, the rest stays valid. We may change these terms; the date at the top shows the latest version. Continued use after a change means you accept it.'
]);
});
/* ---------------- Imprint ---------------- */
doc('v9Imprint','🏢 Imprint (legal notice)',function(b){
sec(b,'Service provider',[
['Operator: '+OP.name+' (a private person, not a company)'],
['Country: '+OP.country],
['E-mail: '+OP.email],
'Postal address of the creator: it is not published. It is given only when an authority asks for it, and only from a request that comes from the e-mail address named above.',
'Information given under Art. 5 of the EU e-Commerce Directive 2000/31/EC (and similar national rules).'
]);
sec(b,'Source files',[
'All the files this site works with are on GitHub: https://github.com/GeorgeMasterBG/AI-INFORMATION'
]);
sec(b,'Content responsibility',[
'The operator named above is responsible for the content of the site itself. Third-party items (posts, videos, pictures, news) belong to their sources, which are named next to each item.'
]);
sec(b,'Hosting',[
'Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, USA (Cloudflare Pages / Workers).'
]);
sec(b,'Contact point for authorities and users (Digital Services Act)',[
'Authorities and users can reach us in English at the e-mail address above. Reports about illegal content: see “Reporting illegal content” in the Terms.'
]);
sec(b,'Accessibility',[
'The site has an Accessibility panel (text size, contrast, motion) and is built for keyboard and screen-reader use. If you find a barrier, please tell us at the e-mail address above.'
]);
});
/* ---------------- Cookie information ---------------- */
doc('v9Cookies','🍪 Cookies and storage',function(b){
sec(b,'What this site stores on your device',[
'No cookies are set by the site itself. The site uses browser storage, which EU law treats the same as cookies. Here is the complete list:',
'⚠️ Even if you reject everything here, your browser and the services that deliver this site may still keep their own cache files or set their own cookies. These are not set by the site itself: your browser’s normal HTTP cache keeps copies of site files, and the hosting provider (Cloudflare) can set technical cookies or logs for security and delivery. We do not control them. You can delete them in your browser settings. The Feed cache does not collect personal data: it only stores images so they can be shown faster. If you see a website setting third-party cookies, that comes from that website’s own policy, not from this site.',
[
 'ai_consent (necessary): your choice, the time of your choice, and whether you have seen the welcome message. Kept until you change it.',
 'Preferences (if allowed): settings such as language, accent colour, reminders you write, theme, video quality, chosen city, quiz progress, recent searches, activity list. localStorage, kept until you delete it.',
 'Notifications (only if you turn them on in Reminders): a small service worker without any cache, so your phone can show the notification.',
 'Offline cache (if allowed): service worker, a cache of site files and recent answers, and downloaded videos (you set the maximum size, 150 MB to 9 GB). Kept until you clear it or the limit makes older files go.',
 'No advertising, analytics or social-media storage is used.']
]);
var go=mkBtn('Change my choices','pri',function(){closePanel('v9Cookies');showConsent(true);});go.style.margin='10px 0';b.appendChild(go);
});


/* ---------------- Accessibility statement ---------------- */
doc('v9Access','♿️ Accessibility statement',function(b){
sec(b,'Our goal',['We want everyone to be able to use this site, including people who use screen readers, keyboards only, magnifiers, voice control or who need strong contrast or less motion. We aim to meet WCAG 2.2 level AA, which includes the web part of the European standard EN 301 549 (WCAG 2.1 AA) required by the European Accessibility Act, and WCAG 2.1 AA as used in the US (ADA Title II rule for public bodies, Section 508).']);
sec(b,'What we did',[['Skip link, page landmarks and a logical heading order.','Colours checked for contrast in the dark and light theme (we ran an automatic checker on the home page and all panels in both themes with no failures).','Everything works with the keyboard; the focus is clearly visible; touch targets are large enough.','Text size, contrast and motion settings in the Accessibility panel. The site also follows your device’s “reduce motion”, “high contrast” and “reduce transparency” settings.','Labels for form fields and buttons; messages that appear are announced to screen readers.']]);
sec(b,'Known limits',[['Third-party content (videos, pictures, news and web pages we link to) is made by others and may not be accessible.','Machine translation can be wrong.','Automatic checks do not find everything. We tested with an automatic checker, not with every screen reader and phone.']]);
sec(b,'Tell us about a problem',['If you cannot use something, write to the e-mail address below and tell us the page, what you tried and which device or assistive technology you use. We aim to answer within 14 days. If you are not satisfied, you can contact the national body that enforces accessibility rules in your country.']);
sec(b,'Status',['This statement was prepared by the site operator itself (self-assessment) and was last updated on '+UPDATED+'.']);
});
/* ---------------- Credits ---------------- */
doc('v9Credits','© Credits and licences',function(b){
sec(b,'Who owns what',['Everything shown from outside sources belongs to its authors. We show short excerpts, titles and links, with the source next to each item. Videos and pictures are shown only when their licence is free (Creative Commons or public domain); items marked as paid, non-commercial-restricted or all-rights-reserved are filtered out.']);
sec(b,'Sources and licences',[
['Wikipedia, Wiktionary, Wikimedia Commons – text CC BY-SA 4.0; each Commons file has its own licence (shown with the item).',
 'Internet Archive – only items with a Creative Commons or public-domain licence.',
 'NASA – public domain, except third-party material marked as such.',
 'PeerTube instances – licence set by each video’s author (free licences only).',
 'Open-Meteo.com – weather data, CC BY 4.0.',
 'Stack Exchange – posts CC BY-SA, shown with a link to the original and author.',
 'Hacker News, Lobsters, Lemmy, Mastodon, DEV and news RSS feeds – headline and link only; the article stays on its own site.',
 'GDELT, URLhaus, Google Safe Browsing, VirusTotal – used only to check links and find news; results belong to those services.',
 'Translation – Google Translate web service (unofficial, may stop working) and MyMemory; the page reader r.jina.ai. Machine translation can be wrong.',
 'Location name lookup – ipwho.is and Open-Meteo geocoding, only after you allow location.']
]);
sec(b,'Report a problem',['If something here infringes your rights, e-mail the address in the Imprint with the link and we will remove it.']);
});
/* ---------------- footer links ---------------- */
var foot=$('vtFoot');
var how=el('div','lg-how');how.style.cssText='margin:10px 0 0;padding:10px 12px;border:1px solid var(--border2);border-radius:10px;font-size:11.5px;line-height:1.55;text-align:left';
var hh=el('b','','🔎 How this site works');how.appendChild(hh);
['The site is a program that runs in your own browser, on your own device, only to run the searches and tools you ask for. It does not steal what you type, does not phish and does not do anything you did not ask for.','The Cloudflare “server” delivers the site files (every website needs a host) and, for some features, fetches public information from the internet for your search words and gives it back to you. It has no accounts, no visitor database and does not keep your searches. It is not a sign that data is being taken.','Details and the list of outside services: Privacy Policy, section 2a and section 5.'].forEach(function(t){var q=el('p','',t);q.style.margin='6px 0 0';how.appendChild(q);});
var hn=el('b','','ℹ️ Honest notes');hn.style.cssText='display:block;margin-top:10px';how.appendChild(hn);NOTES.forEach(function(t){var q=el('p','',t);q.style.margin='6px 0 0';how.appendChild(q);});
var row=el('div','lg-links');row.id='legalLinks';row.setAttribute('role','navigation');row.setAttribute('aria-label','Legal');
[['Privacy Policy','v9Privacy'],['Terms of Use','v9Terms'],['Imprint','v9Imprint'],['Cookies','v9Cookies'],['Credits','v9Credits'],['Accessibility','v9Access']].forEach(function(x){var a=el('button','lg-a',x[0]);a.type='button';a.onclick=function(){openPanel(x[1]);};row.appendChild(a);});
var gh=el('a','lg-a','🐙 GitHub: all the files this site runs on');gh.href='https://github.com/GeorgeMasterBG/AI-INFORMATION';gh.target='_blank';gh.rel='noopener noreferrer';row.appendChild(gh);
var ml=el('a','lg-a','✉️ '+CONTACT);ml.href='mailto:'+CONTACT;row.appendChild(ml);
var cs=el('button','lg-a','Cookie settings');cs.type='button';cs.onclick=function(){showConsent(true);};row.appendChild(cs);
function placeLg(){var f=$('vtFoot')||document.body;f.appendChild(how);f.appendChild(row);}
if(foot||document.readyState!=='loading')placeLg();else document.addEventListener('DOMContentLoaded',placeLg);
/* ---------------- consent banner ---------------- */
var ban=null;
function applyConsent(c,silent){
var hadPrefs=!!(CONS&&CONS.prefs),hadCache=!!(CONS&&CONS.cache);
var w=CONS&&CONS.w;
CONS={v:1,prefs:!!c.prefs,cache:!!c.cache,w:w||0,ver:1};consSave();
if(CONS.prefs)flushMem();else wipeStored(!!CONS.cache);
if(CONS.cache){flushMem();try{if(navigator.serviceWorker&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(function(){});}catch(e){}try{vcApplySize(store.get('ai_vcsize')||1024);}catch(e){}}
else{VC.q=[];purgeCaches();VC.idx={};try{localStorage.removeItem('ai_v9_vidx');}catch(e){}}
if(!silent)toast('Your choice was saved','var(--accent)');
}
function closeBan(){if(ban){ban.remove();ban=null;}document.documentElement.classList.remove('cb-open');}
function showConsent(reopen,after){
closeBan();
var prefs=CONS?!!CONS.prefs:false,cache=CONS?!!CONS.cache:false,detail=!!reopen;
ban=el('div','cb');ban.id='cBanner';ban.setAttribute('role','dialog');ban.setAttribute('aria-modal','false');ban.setAttribute('aria-label','Privacy choices');
var box=el('div','cb-box');ban.appendChild(box);
function draw(){
box.textContent='';
box.appendChild(el('h2','cb-t','🍪 Your privacy choices'));
box.appendChild(el('p','cb-p','This site has no ads and no tracking. It would like to save some things on your device. The site works fine if you say no. You can change this at any time with “Cookie settings” at the bottom of the page.'));
if(navigator.globalPrivacyControl===true){var gp=el('p','cb-p','✓ Your browser sends a Global Privacy Control signal. We respect it: optional storage stays off unless you choose it yourself below.');gp.style.cssText='font-size:12px';box.appendChild(gp);}
var wn=el('p','cb-p','⚠️ '+'Even if you reject everything here, your browser and the services that deliver this site may still keep their own cache files or set their own cookies. These are not set by the site itself: your browser’s normal HTTP cache keeps copies of site files, and the hosting provider (Cloudflare) can set technical cookies or logs for security and delivery. We do not control them. You can delete them in your browser settings. The Feed cache does not collect personal data: it only stores images so they can be shown faster. If you see a website setting third-party cookies, that comes from that website’s own policy, not from this site.');wn.style.cssText='font-size:12px;opacity:.9';box.appendChild(wn);
if(detail){
var opt=function(title,desc,on,set,locked){
var lab=el('label','cb-o');var cb=el('input');cb.type='checkbox';cb.checked=on;if(locked){cb.disabled=true;cb.checked=true;}
cb.onchange=function(){set(cb.checked);};lab.appendChild(cb);
var d=el('span','cb-od');d.appendChild(el('b','',title));d.appendChild(el('span','',desc));lab.appendChild(d);box.appendChild(lab);};
opt('Necessary','Remembers this choice. Always on.',true,function(){},true);
opt('Preferences','Language, theme, video quality, chosen city, quiz progress and recent searches. Stays on your device.',prefs,function(v){prefs=v;});
opt('Offline cache','Site files, recent answers and videos saved on your device so they open fast and offline. You choose the size (150 MB to 9 GB) in the Feed.',cache,function(v){cache=v;});
}
var r=el('div','cb-r');
function bt(txt,fn,cls){var x=el('button','cb-b'+(cls||''),txt);x.type='button';x.onclick=fn;r.appendChild(x);return x;}
function done(c){applyConsent(c);closeBan();if(after)after();}
bt('Accept all',function(){done({prefs:1,cache:1});});
bt('Reject optional',function(){done({prefs:0,cache:0});});
if(detail)bt('Save my choices',function(){done({prefs:prefs,cache:cache});},' cb-sel');else bt('Choose…',function(){detail=true;draw();});
box.appendChild(r);
var l=el('div','cb-l');var a=el('button','lg-a','Privacy Policy');a.type='button';a.onclick=function(){openPanel('v9Privacy');};l.appendChild(a);var a2=el('button','lg-a','Cookies');a2.type='button';a2.onclick=function(){openPanel('v9Cookies');};l.appendChild(a2);box.appendChild(l);
}
draw();document.body.appendChild(ban);document.documentElement.classList.add('cb-open');
var f=ban.querySelector('.cb-b');if(f&&reopen)try{f.focus();}catch(e){}
}
window.AI_CONSENT={show:showConsent,get:function(){return CONS;}};
if(CONS&&!CONS.cache)purgeCaches();
if(!CONS){try{wipeStored(false);purgeCaches();if(hasCookie('ai_welcome'))document.cookie='ai_welcome=; Max-Age=0; Path=/';}catch(e){}showConsent(false,function(){if(window.AI_ASKAGE)window.AI_ASKAGE();if(window.AI_AFTER_CONSENT)window.AI_AFTER_CONSENT();});}
}
