import { useState, useCallback } from 'react'
import { C, ScoreRing, Spinner } from './UI'
import API from '../api'

const PROMPTS = [
  { type:'email', scenario:'You recently moved into a new apartment and discovered several maintenance problems.', task:'Write an email to your building manager, Mr. David Chen, about maintenance issues in your apartment.', points:['Describe at least two specific problems','Explain how the problems are affecting you','Request a specific action and timeline for repairs'] },
  { type:'email', scenario:'Your employer has asked staff to give feedback on a new policy requiring everyone to return to the office five days a week.', task:'Write an email to your manager, Ms. Sarah Williams, sharing your thoughts on the new attendance policy.', points:['State your position clearly','Give at least two reasons to support your view','Suggest a reasonable compromise or alternative'] },
  { type:'opinion', scenario:'A local newspaper is conducting a survey about children and technology.', task:'Some people believe that children under 12 should not be allowed to use smartphones. Do you agree or disagree?', points:['State your opinion clearly','Give two or three specific reasons with examples','Acknowledge the opposing view briefly'] },
  { type:'opinion', scenario:'Your city is considering making all public transportation free for residents.', task:'Do you think public transportation should be free? Write your opinion and support it with reasons.', points:['Clearly state whether you agree or disagree','Give at least two strong reasons for your position','Conclude with a summary of your view'] },
  { type:'opinion', scenario:'A survey is being conducted about work-life balance in Canada.', task:'Some people believe employees should have the right to ignore work emails and calls after working hours. Do you agree?', points:['State your opinion clearly','Provide at least two reasons supporting your view','Include a brief conclusion'] },
]

function ImprovementTask({ task, priorities, onDone }) {
  const [resp, setResp] = useState('')
  const [fb, setFb] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const { data } = await API.post('/trainer/ai/check-improvement/', { area:'Writing', task, response:resp })
      setFb(data.feedback); setDone(true)
    } catch { setFb('Good effort! Focus on formal language and clear paragraph structure.'); setDone(true) }
    setLoading(false)
  }

  return (
    <div style={{ background:'#1a1d27', border:`1px solid ${C.purple}44`, borderRadius:12, padding:16, marginTop:14 }}>
      <div style={{ color:C.purple, fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:8 }}>🎯 IMPROVEMENT TASK</div>
      <div style={{ color:C.text, fontSize:14, lineHeight:1.7, marginBottom:12 }}>{task}</div>
      {!done ? (
        <>
          <textarea value={resp} onChange={e=>setResp(e.target.value)} placeholder="Write your answer here..." style={{ width:'100%', minHeight:100, background:'#0f1117', border:`1px solid ${C.border}`, borderRadius:8, padding:12, color:C.text, fontSize:14, resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
          <button onClick={submit} disabled={loading||resp.length<15} style={{ marginTop:8, padding:'8px 20px', background:C.purple, color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', opacity:resp.length<15?0.5:1 }}>
            {loading?'Checking...':'Submit'}
          </button>
        </>
      ) : (
        <div>
          <div style={{ background:C.purple+'11', borderRadius:8, padding:12, fontSize:14, color:C.text, lineHeight:1.7 }}>{fb}</div>
          <button onClick={onDone} style={{ marginTop:10, padding:'6px 16px', background:'transparent', border:`1px solid ${C.purple}`, color:C.purple, borderRadius:8, fontWeight:700, cursor:'pointer' }}>✓ Done</button>
        </div>
      )}
    </div>
  )
}

export default function WritingTab({ onScore }) {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [improvTask, setImprovTask] = useState(null)
  const [showImprov, setShowImprov] = useState(false)
  const [showTips, setShowTips] = useState(false)

  const prompt = PROMPTS[idx]
  const wc = text.trim() ? text.trim().split(/\s+/).length : 0

  const next = () => { setIdx(i=>(i+1)%PROMPTS.length); setText(''); setSubmitted(false); setResult(null); setImprovTask(null); setShowImprov(false); setShowTips(false) }

  const submit = async () => {
    setLoading(true); setSubmitted(true)
    try {
      const { data } = await API.post('/trainer/ai/writing-feedback/', { task:prompt.task, response:text, word_count:wc })
      setResult(data)
      onScore(data.score, 'Writing', { task_title:prompt.task.slice(0,80), response_text:text })
      if (data.score < 8 && data.topPriorities?.length) {
        const { data:it } = await API.post('/trainer/ai/improvement-task/', { area:'Writing', weak_points:data.topPriorities.join(', ') })
        setImprovTask(it.task)
      }
    } catch {
      setResult({ score:5, spellingErrors:[], grammarErrors:['Could not analyse — try again'], informalLanguage:[], taskFulfillment:'Response received.', structure:'Review structure.', vocabulary:'Expand vocabulary.', strongPoints:'You completed the task.', correctedVersion:text, topPriorities:['Check spelling','Use formal language','Address all bullet points'] })
      onScore(5, 'Writing')
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ color:C.muted, fontSize:12 }}>Prompt {idx+1}/{PROMPTS.length} · {prompt.type==='email'?'📧 Email':'📝 Opinion'}</div>
        {!submitted && <button onClick={next} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'4px 12px', fontSize:12, cursor:'pointer' }}>Skip →</button>}
      </div>

      <div style={{ background:'#0f1117', border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:14 }}>
        <div style={{ color:C.accent, fontSize:10, fontWeight:700, letterSpacing:2, marginBottom:8 }}>YOUR TASK</div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:10, lineHeight:1.6 }}>{prompt.scenario}</div>
        <div style={{ color:C.text, fontWeight:600, fontSize:15, marginBottom:12, lineHeight:1.6 }}>{prompt.task}</div>
        <div style={{ color:C.muted, fontSize:12, marginBottom:6 }}>In your response, make sure to:</div>
        {prompt.points.map((p,i) => <div key={i} style={{ display:'flex', gap:8, marginBottom:5 }}><span style={{ color:C.accent }}>•</span><span style={{ color:C.text, fontSize:13, lineHeight:1.5 }}>{p}</span></div>)}
        <div style={{ marginTop:12, display:'flex', gap:10 }}>
          <span style={{ background:C.blue+'22', border:`1px solid ${C.blue}33`, borderRadius:6, padding:'3px 10px', fontSize:11, color:C.blue, fontWeight:700 }}>⏱ 27 min</span>
          <span style={{ background:C.green+'22', border:`1px solid ${C.green}33`, borderRadius:6, padding:'3px 10px', fontSize:11, color:C.green, fontWeight:700 }}>📝 150–200 words</span>
        </div>
      </div>

      <button onClick={()=>setShowTips(!showTips)} style={{ width:'100%', background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:'8px', fontSize:13, cursor:'pointer', marginBottom:12 }}>
        {showTips?'▲ Hide tips':'▼ Show writing tips'}
      </button>
      {showTips && (
        <div style={{ background:'#1a1d27', border:`1px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:12 }}>
          {['Use formal language — no contractions, no slang (ain\'t → do not)','One idea per paragraph — never repeat the same point','Address every bullet point in the task','Useful connectors: Firstly, Furthermore, However, In conclusion','Check spelling: government, maintenance, privilege, believe, receive'].map((t,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}><span style={{ color:C.green }}>✓</span><span style={{ color:C.text, fontSize:13 }}>{t}</span></div>
          ))}
        </div>
      )}

      {!submitted ? (
        <>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write your response here..." style={{ width:'100%', minHeight:220, background:'#1a1d27', border:`1px solid ${C.border}`, borderRadius:12, padding:14, color:C.text, fontSize:15, lineHeight:1.8, resize:'vertical', fontFamily:'Georgia, serif', outline:'none', boxSizing:'border-box' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', margin:'6px 0 14px', fontSize:13 }}>
            <span style={{ color:wc>220?C.red:wc>=150?C.green:C.muted }}>{wc} words{wc>220?' ⚠️ Too long':wc>=150?' ✓ Good':''}</span>
            <span style={{ color:C.muted }}>Target: 150–200 words</span>
          </div>
          <button onClick={submit} disabled={wc<50} style={{ width:'100%', padding:14, background:C.accent, color:'#000', border:'none', borderRadius:10, fontWeight:800, fontSize:16, cursor:wc<50?'not-allowed':'pointer', opacity:wc<50?0.45:1 }}>
            Submit for AI Feedback
          </button>
        </>
      ) : loading ? <Spinner label="AI examiner is marking your writing..." /> : result && (
        <div>
          <div style={{ background:'#1a1d27', border:`1px solid ${C.accent}44`, borderRadius:12, padding:18, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
              <ScoreRing score={result.score} max={10} />
              <div>
                <div style={{ color:C.accent, fontWeight:800, fontSize:22 }}>Score: {result.score}/10</div>
                <div style={{ color:C.muted, fontSize:13 }}>{result.score>=9?'Excellent 🎉':result.score>=7?'Good 👍':result.score>=5?'Keep going 💪':'Needs work 📚'}</div>
              </div>
            </div>

            {result.spellingErrors?.length>0 && <div style={{ marginBottom:14, padding:12, background:'#ef444410', border:`1px solid ${C.red}33`, borderRadius:10 }}>
              <div style={{ color:C.red, fontSize:12, fontWeight:700, marginBottom:8 }}>🔤 SPELLING ERRORS ({result.spellingErrors.length})</div>
              {result.spellingErrors.map((e,i) => <div key={i} style={{ fontSize:13, color:C.text, marginBottom:4 }}>• {e}</div>)}
            </div>}

            {result.grammarErrors?.length>0 && <div style={{ marginBottom:14, padding:12, background:'#f59e0b10', border:`1px solid ${C.accent}33`, borderRadius:10 }}>
              <div style={{ color:C.accent, fontSize:12, fontWeight:700, marginBottom:8 }}>📝 GRAMMAR ERRORS ({result.grammarErrors.length})</div>
              {result.grammarErrors.map((e,i) => <div key={i} style={{ fontSize:13, color:C.text, marginBottom:4 }}>• {e}</div>)}
            </div>}

            {result.informalLanguage?.length>0 && <div style={{ marginBottom:14, padding:12, background:'#8b5cf610', border:`1px solid ${C.purple}33`, borderRadius:10 }}>
              <div style={{ color:C.purple, fontSize:12, fontWeight:700, marginBottom:8 }}>🗣 INFORMAL LANGUAGE — avoid in CELPIP</div>
              {result.informalLanguage.map((e,i) => <div key={i} style={{ fontSize:13, color:C.text, marginBottom:4 }}>• {e}</div>)}
            </div>}

            {[['Task Fulfillment','taskFulfillment'],['Structure & Flow','structure'],['Vocabulary','vocabulary']].map(([label,key]) => result[key] ? (
              <div key={key} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
                <div style={{ color:C.accent, fontSize:11, fontWeight:700, marginBottom:4 }}>{label.toUpperCase()}</div>
                <div style={{ color:C.text, fontSize:14, lineHeight:1.65 }}>{result[key]}</div>
              </div>
            ) : null)}

            {result.strongPoints && <div style={{ background:'#10b98110', border:`1px solid ${C.green}33`, borderRadius:8, padding:12, marginBottom:12 }}>
              <div style={{ color:C.green, fontSize:11, fontWeight:700, marginBottom:4 }}>✅ WHAT YOU DID WELL</div>
              <div style={{ color:C.text, fontSize:14, lineHeight:1.6 }}>{result.strongPoints}</div>
            </div>}

            {result.topPriorities?.length>0 && <div style={{ background:C.accent+'10', border:`1px solid ${C.accent}33`, borderRadius:8, padding:12 }}>
              <div style={{ color:C.accent, fontSize:11, fontWeight:700, marginBottom:8 }}>🎯 TOP 3 THINGS TO IMPROVE</div>
              {result.topPriorities.map((p,i) => <div key={i} style={{ fontSize:13, color:C.text, marginBottom:4 }}>{i+1}. {p}</div>)}
            </div>}
          </div>

          {result.correctedVersion && <div style={{ background:'#1a1d27', border:`1px solid ${C.green}44`, borderRadius:12, padding:16, marginBottom:14 }}>
            <div style={{ color:C.green, fontSize:11, fontWeight:700, marginBottom:10 }}>✍️ CORRECTED VERSION — your ideas, better English</div>
            <div style={{ color:C.text, fontSize:14, lineHeight:1.85, whiteSpace:'pre-wrap' }}>{result.correctedVersion}</div>
          </div>}

          {improvTask && !showImprov && <button onClick={()=>setShowImprov(true)} style={{ width:'100%', marginBottom:12, padding:12, background:C.purple+'22', border:`1px solid ${C.purple}44`, color:C.purple, borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:14 }}>🎯 Get Improvement Task for Your Weak Area</button>}
          {showImprov && improvTask && <ImprovementTask task={improvTask} onDone={()=>{setShowImprov(false);setImprovTask(null)}} />}
          <button onClick={next} style={{ width:'100%', marginTop:4, padding:12, background:'transparent', border:`1px solid ${C.accent}`, color:C.accent, borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:15 }}>🔄 New Writing Task</button>
        </div>
      )}
    </div>
  )
}
