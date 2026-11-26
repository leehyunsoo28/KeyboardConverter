
  const input = document.querySelector('#input'), output = document.querySelector('#output');
  const inputStatus = document.querySelector('#inputStatus'), outputStatus = document.querySelector('#outputStatus');
  const modes = [...document.querySelectorAll('.mode')]; let mode = 'enko';

  const initials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const vowels = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const finals = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const keyToJamo = {r:'ㄱ',R:'ㄲ',s:'ㄴ',e:'ㄷ',E:'ㄸ',f:'ㄹ',a:'ㅁ',q:'ㅂ',Q:'ㅃ',t:'ㅅ',T:'ㅆ',d:'ㅇ',w:'ㅈ',W:'ㅉ',c:'ㅊ',z:'ㅋ',x:'ㅌ',v:'ㅍ',g:'ㅎ',k:'ㅏ',o:'ㅐ',i:'ㅑ',O:'ㅒ',j:'ㅓ',p:'ㅔ',u:'ㅕ',P:'ㅖ',h:'ㅗ',y:'ㅛ',n:'ㅜ',b:'ㅠ',m:'ㅡ',l:'ㅣ'};
  const jamoToKey = Object.fromEntries(Object.entries(keyToJamo).map(([k,v])=>[v,k]));
  Object.assign(jamoToKey, {'ㅘ':'hk','ㅙ':'ho','ㅚ':'hl','ㅝ':'nj','ㅞ':'np','ㅟ':'nl','ㅢ':'ml'});
  const doubleInitial = {'ㄱㄱ':'ㄲ','ㄷㄷ':'ㄸ','ㅂㅂ':'ㅃ','ㅅㅅ':'ㅆ','ㅈㅈ':'ㅉ'};
  const doubleVowel = {'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ','ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ'};
  const doubleFinal = {'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ'};
  const finalParts = Object.fromEntries(Object.entries(doubleFinal).map(([k,v])=>[v,[...k]]));
  const finalToInitial = {'ㄱ':'ㄱ','ㄲ':'ㄲ','ㄴ':'ㄴ','ㄷ':'ㄷ','ㄹ':'ㄹ','ㅁ':'ㅁ','ㅂ':'ㅂ','ㅅ':'ㅅ','ㅆ':'ㅆ','ㅇ':'ㅇ','ㅈ':'ㅈ','ㅊ':'ㅊ','ㅋ':'ㅋ','ㅌ':'ㅌ','ㅍ':'ㅍ','ㅎ':'ㅎ'};
  const initialsSet = new Set(initials), vowelsSet = new Set(vowels), finalsSet = new Set(finals.slice(1));
  function composeKeys(text){
    const units=[...text].map(c=>keyToJamo[c]||c), out=[]; let i=0;
    while(i<units.length){
      let a=units[i], b=units[i+1], ini=a;
      if(doubleInitial[a+b]){ini=doubleInitial[a+b];i+=2}else if(initialsSet.has(a))i++;else{out.push(a);i++;continue}
      if(!vowelsSet.has(units[i])){out.push(ini);continue}
      let vow=units[i++];let joined=doubleVowel[vow+units[i]];if(joined){vow=joined;i++}
      let fin='';
      if(i<units.length&&finalsSet.has(units[i])){
        const cand=units[i], next=units[i+1];
        if(doubleFinal[cand+next]&&!vowelsSet.has(units[i+2])){fin=doubleFinal[cand+next];i+=2}
        else if(doubleFinal[cand+next]&&vowelsSet.has(units[i+2])){fin=cand;i++}
        else if(vowelsSet.has(next)){/* next syllable begins with this consonant */}
        else {fin=cand;i++}
      }
      const code=0xAC00+(initials.indexOf(ini)*21+vowels.indexOf(vow))*28+finals.indexOf(fin);
      out.push(String.fromCharCode(code));
    }
    return out.join('');
  }
  function decomposeHangul(text){
    const out=[];
    for(const ch of text.normalize('NFC')){const n=ch.charCodeAt(0)-0xAC00;if(n<0||n>11171){out.push(jamoToKey[ch]||ch);continue}
      const ii=Math.floor(n/588),vi=Math.floor((n%588)/28),fi=n%28;
      const jamo=[initials[ii],vowels[vi]];
      if(fi){const f=finals[fi];if(finalParts[f])jamo.push(...finalParts[f]);else jamo.push(f)}
      out.push(jamo.map(part=>jamoToKey[part]||part).join(''));
    }
    // Capitalize the first English key in each word, retaining spaces and punctuation.
    let atWordStart=true;
    return out.join('').replace(/[A-Za-z]|\s|./g, ch=>{
      if(/[A-Za-z]/.test(ch)){const result=atWordStart?ch.toUpperCase():ch;atWordStart=false;return result}
      if(/\s/.test(ch))atWordStart=true;
      return ch;
    });
  }
  function convert(){const s=input.value; inputStatus.textContent=s?`${s.length}자 입력됨`:'텍스트를 입력하세요';
    output.value=mode==='enko'?composeKeys(s):mode==='koen'?decomposeHangul(s):mode==='lower'?s.toLowerCase():s.toUpperCase();
    outputStatus.textContent=output.value?`${output.value.length}자 변환됨`:'결과가 여기에 표시돼요';}
  modes.forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;modes.forEach(b=>b.classList.toggle('active',b===btn));convert()}));
  input.addEventListener('input',convert);  document.querySelector('#copy').addEventListener('click',async e=>{if(!output.value)return;try{await navigator.clipboard.writeText(output.value);e.currentTarget.textContent='복사 완료!';setTimeout(()=>e.currentTarget.textContent='결과 복사',1400)}catch{output.select();document.execCommand('copy');e.currentTarget.textContent='복사 완료!';setTimeout(()=>e.currentTarget.textContent='결과 복사',1400)}});
  document.querySelector('#swap').addEventListener('click',()=>{input.value=output.value;mode=mode==='enko'?'koen':mode==='koen'?'enko':mode; modes.forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));convert();input.focus()});
