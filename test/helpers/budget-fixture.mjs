import { createHash } from 'node:crypto';
export function budgetFixture({body='## 项目仓库\nhttps://github.com/logicrw/material-demo',owner='submitter',title=''}={}){
  const comments=[],writes=[],trees=new Map(),commits=new Map();let head=null,sequence=0;
  const main='a'.repeat(40),tree='b'.repeat(40);trees.set(tree,new Map());commits.set(main,{tree:{sha:tree},parents:[]});
  const next=()=>createHash('sha1').update(String(++sequence)).digest('hex');
  const error=(status)=>Object.assign(new Error(`HTTP ${status}`),{status});
  const api=async(path,options={})=>{
    const method=options.method??'GET',input=options.body;
    if(method!=='GET')writes.push({path,...options});
    if(path.endsWith('/git/ref/heads/main'))return{object:{sha:main}};
    if(path.endsWith('/git/ref/heads/ingestion-budget')){if(!head)throw error(404);return{object:{sha:head}};}
    if(path.includes('/contents/')){
      const ref=new URL('https://api.github.com'+path).searchParams.get('ref');
      const filename=path.split('/contents/')[1].split('?')[0];
      const text=trees.get(commits.get(ref)?.tree.sha)?.get(filename);if(!text)throw error(404);
      return{encoding:'base64',size:Buffer.byteLength(text),content:Buffer.from(text).toString('base64')};
    }
    if(path.endsWith('/git/trees')&&method==='POST'){
      const sha=next(),files=new Map(trees.get(input.base_tree));
      for(const entry of input.tree)files.set(entry.path,entry.content);
      trees.set(sha,files);return{sha};
    }
    if(path.endsWith('/git/commits')&&method==='POST'){const sha=next();commits.set(sha,{tree:{sha:input.tree},parents:input.parents});return{sha};}
    if(path.includes('/git/commits/'))return commits.get(path.split('/').at(-1));
    if(path.endsWith('/git/refs')&&method==='POST'){if(head)throw error(422);head=input.sha;return{};}
    if(path.endsWith('/git/refs/heads/ingestion-budget')&&method==='PATCH'){
      if(commits.get(input.sha)?.parents[0]!==head)throw error(409);head=input.sha;return{};
    }
    if(path.includes('/issues/')&&path.includes('/comments')){
      if(method==='POST'){comments.push({user:{login:'github-actions[bot]'},body:input.body,created_at:'2026-10-09T00:00:00Z'});return{};}
      return comments;
    }
    if(path.includes('/issues/'))return{number:Number(path.split('/').at(-1)),state:'open',body,title,user:{login:owner},comments:comments.length};
    throw Error(`Unexpected mock route ${method} ${path}`);
  };
  const seed=(global,cases={})=>{const files=new Map([['radar/review-budget.json',JSON.stringify(global)]]);for(const [caseId,record]of Object.entries(cases))files.set(`radar/review-budget-cases/${caseId.slice(0,2)}/${caseId}.json`,JSON.stringify(record));const treeSha=next();trees.set(treeSha,files);head=next();commits.set(head,{tree:{sha:treeSha},parents:[main]});};
  return{api,comments,writes,seed,registry:()=>{if(!head)return null;const files=trees.get(commits.get(head).tree.sha);const global=JSON.parse(files.get('radar/review-budget.json'));return{...global,cases:Object.fromEntries([...files].filter(([path])=>path.startsWith('radar/review-budget-cases/')).map(([path,text])=>[path.split('/').at(-1).slice(0,-5),JSON.parse(text)]))};}};
}
